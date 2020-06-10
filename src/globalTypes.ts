import { ObjectType } from "yaschva";


export type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type SearchTypes = 'textSearch' | 'full' | 'idOnly' | ObjectType;
export const httpMethods: HttpMethods[] = ['get' , 'post' , 'put'  ,'patch' , 'delete']


