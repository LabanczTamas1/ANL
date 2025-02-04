import React from 'react'
import BasicSlider from '../Loaders/BasicLoader'
import AnimatedLoader from '../Loaders/AnimatedLoader'

const EmptyPage = () => {
  return (
    <div className='flex justify-center items-center h-screen gap-10 h-[200vh]'>
      <BasicSlider />
      <AnimatedLoader />
    </div>
  )
}

export default EmptyPage
