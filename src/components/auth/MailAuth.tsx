import { useActionState } from "react";
import AlertError from '../AlertError';
import { mailAuth } from '@/actions/authFunctions';

const MailAuth = ({
    email,
    typeValue,
}:{
    email:string
    typeValue: 'SignUp'|'SignIn',
}) => {
    const mailAuthWithTypeValue = mailAuth.bind(null, typeValue);
    const [state, formAction,isPending] = useActionState(
        mailAuthWithTypeValue,
        {
            message:'',
            data:{
                email:{value:email, error:''},
                authenticationPassword:{value:'', error:''},
            },
        }
    );

    return(<>
        <div className="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
                <p className='text-red-600 text-center'>
                    ✉{email}<br/>認証パスワードを送信しました
                </p>

                {state.message && <AlertError errMessage={state.message} reloadBtFlag={true}/>}

                <form 
                    action={formAction}
                    className="mt-3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
                >
                    <input
                        name='email'
                        type='hidden'
                        required={true}
                        defaultValue={state.data.email.value}
                    />
                    <div className="mb-4">
                        <label className='block text-gray-700 text-md font-bold'>6桁認証番号<em>*</em></label>
                        <span className='text-xs text-gray-500'>6桁の半角数字を入力して下さい</span>
                        <input
                            name='authenticationPassword'
                            type='text'
                            defaultValue={state.data.authenticationPassword.value}
                            required={true}
                            placeholder="認証パスワード"
                            className={`
                                ${state.data.authenticationPassword.error&&'border-red-500'} 
                                bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
                            `}
                        />
                        {state.data.authenticationPassword&& 
                            <span className='text-red-500 text-xs italic'>
                                {state.data.authenticationPassword.error}
                            </span>
                        }
                    </div>
                    <div className='flex items-center justify-between'>
                        <button
                            className={`
                            bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline 
                            ${isPending&&'cursor-not-allowed'}
                            `}
                            disabled={isPending}
                            type="submit"
                        >
                            {isPending ? '・・Loading・・' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>);
}
export default MailAuth;