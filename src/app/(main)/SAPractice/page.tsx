"use client";
import { counterV1, counterV2, counterV3, counterV4 } from "@/actions/authFunctions";
import { useActionState } from "react";


export default function ServerActionsPracticePage() {
    const [stateV1, formActionV1] = useActionState(counterV1, 0);
    const [stateV2, formActionV2] = useActionState(counterV2, {count:0});
    const [stateV3, formActionV3] = useActionState(counterV3, {count:0});
    const [stateV4, formActionV4] = useActionState(
        counterV4,
        {
            count:0,
            text:''
        }
    );

    return (<>
        <form action={formActionV1} className="my-3 space-x-3">
            V1:Count: {stateV1}
            <button className="bg-slate-300">Increment</button>
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
            <button className="bg-slate-300">Increment</button>
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
            <button className="bg-slate-300">Increment</button>
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
            <button className="bg-slate-300">Increment</button>
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
