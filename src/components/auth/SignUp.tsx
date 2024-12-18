import { useActionState } from "react";
import AlertError from '../AlertError';
import { signUp } from '@/actions/authFunctions';
import MailAuth from './MailAuth';

export default function SignUp() {
    const [state, formAction,isPending] = useActionState(
        signUp,
        {
            message:'',
            data:{
                name:{value:'',error:''},
                email:{value:'',error:''},
                password:{value:'',error:''},
            },
        }
    );

    return (<>
        <div className="flex items-center justify-center mt-5">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
                {state.message!=='success'
                    ?(<>
                        {state.message && <AlertError errMessage={state.message} reloadBtFlag={false}/>}
                        <form 
                            action={formAction}
                            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
                        >
                            <div className="mb-4">
                                <label className='block text-gray-700 text-md font-bold'>ユーザー名<em>*</em></label>
                                <span className='text-xs text-gray-500'>{`「< > % ;」`}は使用できません</span>
                                <input
                                    name='name'
                                    type='text'
                                    defaultValue={state.data.name.value}
                                    required={true}
                                    placeholder="ユーザー名"
                                    className={`
                                        ${state.data.name.error&&'border-red-500'}
                                        bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
                                    `}
                                />
                                {state.data.name.error && <span className='text-red-500 text-xs italic'>{state.data.name.error}</span>}
                            </div>
                            <div className="mb-4">
                                <label className='block text-gray-700 text-md font-bold'>メールアドレス<em>*</em></label>
                                <span className='text-xs text-gray-500'>メールアドレス</span>
                                <input
                                    name='email'
                                    type='text'
                                    defaultValue={state.data.email.value}
                                    required={true}
                                    placeholder="メールアドレス"
                                    className={`
                                        ${state.data.email.error&&'border-red-500'} 
                                        bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
                                    `}
                                />
                                {state.data.email.error && <span className='text-red-500 text-xs italic'>{state.data.email.error}</span>}
                            </div>
                            <div className="mb-6">
                                <label className='block text-gray-700 text-md font-bold'>パスワード<em>*</em></label>
                                <span className='text-xs text-gray-500'>5文字以上の半角の英数字を入力して下さい</span>
                                <input
                                    name='password'
                                    type='password'
                                    defaultValue={state.data.password.value}
                                    required={true}
                                    placeholder="パスワード"
                                    className={`
                                        ${state.data.password.error&&'border-red-500'} 
                                        bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
                                    `}
                                />
                                {state.data.password.error && <span className='text-red-500 text-xs italic'>{state.data.password.error}</span>}
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
                                    {isPending ? '・・Loading・・' : 'SignUp'}
                                </button>
                            </div>
                        </form>
                    </>):(
                        <MailAuth email={state.data.email.value} typeValue={'SignUp'}/>
                    )
                }
            </div>
        </div>

    </>)
}