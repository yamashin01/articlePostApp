"use client";
import { counterV1, counterV2, counterV3, counterV4 } from "@/actions/counterFunctions";
import { useActionState } from "react";

export default function ServerActionsPracticePage() {
    const [stateV1, formActionV1,isPending] = useActionState(counterV1, 0);
    const [stateV2, formActionV2,isPendingV2] = useActionState(counterV2, {count:0});
    const [stateV3, formActionV3,isPendingV3] = useActionState(counterV3, {count:0});
    const [stateV4, formActionV4,isPendingV4] = useActionState(
        counterV4,
        {
            count:0,
            text:'',
        }
    );

    return (<>
        <form action={formActionV1} className="my-3 space-x-3">
            V1:Count: {stateV1}
            <button type="submit" disabled={isPending} className="bg-slate-300">Increment</button>
            <div className="my-3">
                <input
                    type='text'
                    required={true}
                    className="bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
        </form>
        <hr/>
        <form action={formActionV2} className="my-3 space-x-3">
            V2:Count: {stateV2.count}
            <button disabled={isPendingV2} className="bg-slate-300">Increment</button>
            <div className="my-3">
                <input
                    type='text'
                    required={true}
                    className="bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
        </form>
        <hr/>
        <form action={formActionV3} className="my-3 space-x-3">
            V3:Count: {stateV3.count}
            <button disabled={isPendingV3} className="bg-slate-300">Increment</button>
            <div className="my-3">
                <input
                    type='text'
                    required={true}
                    className="bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
        </form>
        <hr/>
        <form action={formActionV4} className="my-3 space-x-3">
            V4:Count: {stateV4.count}
            <button
                disabled={isPendingV4} 
                className={`bg-slate-300 ${isPendingV4 && 'cursor-not-allowed'}`}
            >
                Increment
            </button>
            <div className="my-3">
                <input
                    name='text'
                    type='text'
                    required={true}
                    defaultValue={stateV4.text}
                    className="bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
        </form>
    </>);
}
