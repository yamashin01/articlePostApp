import { Thumbnail } from "@prisma/client"

//////////
//■[ 認証 ]
export type AuthUser = {
    id:number
    name:string
}

//////////
//■[ ServerActions ]
export interface SignUpFormState {
    message:string
    data:{
        name:{
            value:string
            error:string
        }
        email:{
            value:string
            error:string
        }
        password:{
            value:string
            error:string
        }
    }
}
export interface SignInFormState {
    message:string
    data:{
        email:{
            value:string
            error:string
        }
        password:{
            value:string
            error:string
        }
    }
}
export interface MailAuthFormState {
    message:string
    data:{
        email:{
            value:string
            error:string
        }
        authenticationPassword:{
            value:string
            error:string
        }
    }
}

//////////
//■[ PostForm ]
export type PostForm = {
    title:[string,string]//値,err文字
    description:[string,string]//値,err文字
}
export type MarkdownForm = {
    content:[string,string]//値,err文字
}

//////////
//■[ prisma fetch data ]
export type PostWithThumbnail =  {
    id: number;
    title: string;
    description?: string;
    content?: string;
    thumbnailId: number | null;
    Thumbnail: Thumbnail | null;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}
export type PostWithThumbnailList =  PostWithThumbnail[]

export type WhereObject = {
    userId?:number
    AND?: {
        OR: {
            title?: {
              contains: string;
            };
            description?: {
              contains: string;
            };
            content?: {
              contains: string;
            };
        }[]
    }[];
};

export type OptionObType = {
    select: {
        id: true,
        title: true,
        description?: true,
        thumbnailId: true,
        Thumbnail:true,
        userId: true,
        createdAt: true,
        updatedAt?:true,
    }
    where?:WhereObject
    orderBy?: { createdAt: 'desc'|'asc' }
    skip?: number
    take?: number
}
