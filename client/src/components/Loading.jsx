import React from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function Loading() {

    const {navigate} = useContext(AppContext)

    const {search} = useLocation();

    const query = new URLSearchParams(search)
    const nextUrl = query.get("next")

    useEffect(()=>{
        if(nextUrl){
            setTimeout(()=>{
                navigate(`/${nextUrl}`)
            },5000)
        }
    },[nextUrl])

  return (
    <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-fll h-24 w-24 border-4 border-gray-3 norder-t-primary'>

        </div>
      
    </div>
  )
}

export default Loading
