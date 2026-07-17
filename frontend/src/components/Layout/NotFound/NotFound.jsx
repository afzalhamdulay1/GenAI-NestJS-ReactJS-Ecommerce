import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div>This page doesnt exist. go to <Link to="/" className='text-red-500'>Home</Link></div>
  )
}

export default NotFound