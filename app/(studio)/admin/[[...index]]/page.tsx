"use client"; //render in the browser on the client side, not the server

import config from "@/sanity.config"; //@ is shorthand for root
import { NextStudio } from "next-sanity/studio";


export default function AdminPage() {
    //initially had white space here, and it broke the code, so be cautious of that! possibly an invisible character
    return <NextStudio config={config}/>
    //this is all it take to drop the sanity studio into a nextjs app
}