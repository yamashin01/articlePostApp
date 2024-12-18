'use server'
//〇：countの加算
//✖：入力値の保持
export async function counterV1(state:number) {
    state++;//state = state+1;
    return state;
}

//✖：countの加算
//✖：入力値の保持
export async function counterV2(state:{count:number}) {
    state.count++;//state.count = state.count+1;
    console.log(state)
    return state;
}

//〇：countの加算
//✖：入力値の保持
export async function counterV3(state:{count:number}) {
    //■[ structuredClone() ]
    //・イミュータブルな更新が必要な場合、structuredClone()は便利なツールです。
    //　ただし、パフォーマンスを考慮する必要がある場合は、必要な部分だけを選択的にコピーする方が効率的な場合もあります。    
    //・関数,DOMノード,一部のオブジェクト(Error,WeakMap)、などはコピーできない。
    const newState = structuredClone(state);
    newState.count++;//state.count = state.count+1;
    console.log(newState)
    return newState;
}

//〇：countの加算
//〇：入力値の保持
export async function counterV4(
    state:{
        count:number
        text:string
    },
    formData: FormData
) {
    //初期化/イミュータブル 
    const newState = structuredClone(state);
    //データ取得
    const text = formData.get('text') as string;
    //デート反映
    newState.count = newState.count+1;
    newState.text = text;
    //return
    return newState;
}

