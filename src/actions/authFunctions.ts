'use server'
import { validationForAuthenticationPassword, validationForPassword, validationForEmail, validationForWord } from "@/lib/functions/myValidation";
import { generateRandomNumber6, saveAccessTokenInCookies } from "@/lib/functions/seculity";
import { sendMail } from "@/lib/nodemailer";
import prisma from "@/lib/prisma";
import { SignUpFormState, SignInFormState, MailAuthFormState} from "@/lib/types";
import * as bcrypt from 'bcrypt';
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

const emailOrPasswordErr = 'The email or password is incorrect.';//攻撃されることを想定し、どちらが間違っていたか予測がつかないように

//新規User作成
export const signUp = async (state: SignUpFormState, formData: FormData) => {
    //////////
    //■[ 初期化/イミュータブル ]
    const initialState:SignUpFormState = structuredClone(state);
    try{
        //////////
        //■[ formData ]
        // formDataから値を取得
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        // 入力値を保持/反映
        initialState.data.name.value=name;
        initialState.data.email.value=email;
        initialState.data.password.value=password;
        // Required validation
        if(!name || !email || !password){
            initialState.message = 'Bad request error.'
            return initialState;
        }

        //////////
        //■[ validation ]
        //・name
        let result = validationForWord(name);
        if(!result.result){
            initialState.data.name.error = result.message;
        }else if(initialState.data.name.error){
            initialState.data.name.error = '';
        }
        //・email
        result = validationForEmail(email);
        if(!result.result){
            initialState.data.email.error = result.message;
        }else if(initialState.data.email.error){
            initialState.data.email.error = '';
        }
        //・password
        result = validationForPassword(password);
        if(!result.result){
            initialState.data.password.error = result.message;
        }else if(initialState.data.password.error){
            initialState.data.password.error = '';
        }
        //＊
        if(initialState.data.name.error || initialState.data.email.error || initialState.data.password.error){
            initialState.message = 'Bad request error.';
            return initialState;
        }else if(initialState.message){
            initialState.message = '';
        }

        //////////
        //■[ 不要データの削除 ]
        prisma.user.deleteMany({
            where: {
                verifiedEmail:false,
                createdAt: {
                    lt: new Date(Date.now() - 1000 * 60 * 4)//4分経過：認証パスワードの有効期限は3分
                }
            }
        }).catch((err)=>console.log(err.message));

        //////////
        //■[ パスワードをハッシュ化 ]
        const hashed = await bcrypt.hash(password, 11);

        //////////
        //■[ 6桁の認証パスワードを生成 ]
        const randomNumber6 = generateRandomNumber6();

        //////////
        //■[ transaction ]
        await prisma.$transaction(async (prismaT) => {
            //新規User作成
            await prismaT.user.create({
                data: {
                    name,
                    email,
                    hashedPassword: hashed,
                    verifiedEmail:false,
                    authenticationPassword:randomNumber6,
                },
            });
            //認証メール送信
            const {result,message} = await sendMail({
                toEmail: email,
                subject: '二段階認証パスワード',
                text: '以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。',
                html:`
                    <p>以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。</p>
                    <br/>
                    <p>${randomNumber6}</p>
                `
            });
            if(!result)throw new Error(message);
        },
        {
            maxWait: 10000, // default: 2000
            timeout: 25000, // default: 5000
        }).catch((err)=>{
            throw err;
        });
        
        //////////
        //■[ return(処理成功) ]
        initialState.message = 'success';
        return initialState;
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        initialState.message = err instanceof Error ?  err.message : `Internal Server Error.`;
        return initialState;
    }
};


//ログイン
export const signIn = async (state: SignInFormState, formData: FormData) => {
    //////////
    //■[ 初期化/イミュータブル ]
    const initialState: SignInFormState = structuredClone(state);
    try{
        //////////
        //■[ formData ]
        // formDataから値を取得
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        // 入力値を保持/反映
        initialState.data.email.value = email;
        initialState.data.password.value = password;
        // Required validation
        if (!email || !password) {
            initialState.message = 'Bad request error.';
            return initialState;
        }

        //////////
        //■[ validation ]
        //・email
        let result = validationForEmail(email);
        if(!result.result){
            initialState.data.email.error = result.message;
        }else if(initialState.data.email.error){
            initialState.data.email.error = '';
        }
        //・password
        result = validationForPassword(password);
        if(!result.result){
            initialState.data.password.error = result.message;
        }else if(initialState.data.password.error){
            initialState.data.password.error = ''
        }
        //＊
        if (initialState.data.email.error || initialState.data.password.error) {
            initialState.message = 'Bad request error.';
            return initialState;
        }else if(initialState.message){
            initialState.message = '';
        }

        //////////
        //■[ 認証:メールアドレス,パスワード ]
        //・メールアドレス
        const checkUser = await prisma.user.findFirst({
            where:{
                email,
                verifiedEmail:true
            }
        });
        if(!checkUser){
            initialState.data.email.error = emailOrPasswordErr;
            initialState.data.password.error = emailOrPasswordErr;
            initialState.message = emailOrPasswordErr;
            return initialState
        }
        //・パスワード
        try{
            const result = await bcrypt.compare(password, checkUser.hashedPassword);
            if(!result){
                initialState.data.email.error = emailOrPasswordErr;
                initialState.data.password.error = emailOrPasswordErr;
                initialState.message = emailOrPasswordErr;
                return initialState
            }
        }catch(err){
            throw err;
        }

        //////////
        //■[ SMS認証 ]◆
        //・6桁の乱数を生成
        const randomNumber6 = generateRandomNumber6();
        //・User の authenticationPassword & updatedAt を更新
        await prisma.user.update({
            where:{id:checkUser.id},
            data:{
                authenticationPassword:randomNumber6,
                updatedAt: new Date()
            }
        });
        //・認証メール送信
        const sendMailResult = await sendMail({
            toEmail: email,
            subject: '2段階認証パスワード',
            text: '以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。',
            html:`
                <p>以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。</p>
                <br/>
                <p>${randomNumber6}</p>
            `
        });
        if(!sendMailResult.result)throw new Error(sendMailResult.message);
        
        //////////
        //■[ return(処理成功) ]
        initialState.message='success';
        return initialState;
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        initialState.message = err instanceof Error ?  err.message : `Internal Server Error.`;
        return initialState;
    }
};


//「signUp or signIn」→ メール認証
export const mailAuth = async (
    typeValue: 'SignUp'|'SignIn',
    state: MailAuthFormState,
    formData: FormData
) => {
    const initialState:MailAuthFormState = structuredClone(state);
    let userId:number = 0;
    try{
        //////////
        //■[ formDataから値を取得 ]
        // formDataから値を取得
        const email = formData.get('email') as string;
        const authenticationPassword = formData.get('authenticationPassword') as string;
        // 入力値を保持/反映
        initialState.data.email.value = email;
        initialState.data.authenticationPassword.value = authenticationPassword;
        // Required validation
        if(!email || !authenticationPassword){
            initialState.message = 'Bad request error.'
            return initialState;
        }

        //////////
        //■[ validation ]
        //・email
        let result = validationForEmail(email);
        if(!result.result){
            initialState.data.email.error = result.message;
        }else if(initialState.data.email.error){
            initialState.data.email.error = '';
        }
        //・authenticationPassword
        result = validationForAuthenticationPassword(authenticationPassword);
        if(!result.result){
            initialState.data.authenticationPassword.error = result.message;
        }else if(initialState.data.authenticationPassword.error){
            initialState.data.authenticationPassword.error = '';
        }
        //＊
        if(initialState.data.email.error || initialState.data.authenticationPassword.error){
            initialState.message = 'Bad request error.';
            return initialState;
        }else if(initialState.message){
            initialState.message = ''
        }

        //////////
        //■[ userチェック～経過時間の検証 ]
        const checkUser = await prisma.user.findUnique({
          where:{
            email,
          }
        });
        //Userが存在しない
        if(!checkUser)throw new Error(`Something went wrong. Please try again.`);
        userId = checkUser.id;
        //ログインを試みたが、メールアドレスの認証が未完了
        if(typeValue=='SignIn' && !checkUser.verifiedEmail)throw new Error('That user is disabled. SMS authentication has not been completed.');
        //認証パスワードが違う
        if(checkUser.authenticationPassword!==Number(authenticationPassword))throw new Error(`Authentication password is incorrect.`);
        //経過時間の検証：3分以上経過していたらエラーとする
        const beforeTime = checkUser.updatedAt;
        const currentTime = new Date();
        const elapsedMilliseconds = currentTime.getTime() - beforeTime.getTime();// beforeTimeから現在の日時までの経過時間(ミリ秒単位)を計算
        const elapsedMinutes = elapsedMilliseconds / (1000 * 60);// 経過時間を分単位に変換
        if (elapsedMinutes >= 3){
          if(typeValue==='SignUp')await prisma.user.delete({where:{id:userId}});//User新規作成時、3分超過により認証が失敗した場合は、Userを削除
          throw new Error(`More than 3 minutes have passed. Please try again.`);
        }

        //////////
        //■[ 新規作成時のSMS認証なら、verifiedemail:true に更新 ]
        if(typeValue==='SignUp'){
            await prisma.user.update({
                where:{id:userId},
                data:{
                    verifiedEmail:true
                }
            });
        }

        //////////
        //■[ accessToken をサーバーサイドcookiesに保存 ]
        const savedResult = await saveAccessTokenInCookies({id:userId, name:checkUser.name});
        if(!savedResult.result)throw new Error(savedResult.message);
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        initialState.message = err instanceof Error ?  err.message : `Internal Server Error.`;
        return initialState;
    }

    //////////
    //■[ 処理成功時、リダイレクト ]
    //・redirectはtry-catchの外で実行することが推奨されている:https://nextjs.org/docs/app/building-your-application/routing/redirecting
    redirect(`/user/${userId}`);
}


export const signOut = async(state: string) => {
    try{
        //////////
        //■[ jwtをサーバーサイドcookieから削除 ]
        const accessToken = (await cookies()).get('accessToken');
        if(accessToken)(await cookies()).delete('accessToken');
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state = err instanceof Error ?  err.message : `Internal Server Error.`
        return state;
    }
    
    //////////
    //■[ 処理成功時、リダイレクト ]
    //・redirectはtry-catchの外で実行することが推奨されている:https://nextjs.org/docs/app/building-your-application/routing/redirecting
    redirect('/auth');
} 

