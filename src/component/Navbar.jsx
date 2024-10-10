import React from 'react'

const Navbar = () => {
  return (
    <div>
      <nav className="bg-slate-700 text-white">
        <div className="mycontainer flex justify-between items-center px-4 py-4 h-14 ">

        <div className='md:mx-20 logo font-bold text-2xl'>
          <span className='text-green-500'> &lt;</span>
          Pass
          <span className='text-green-500'>OP/ &gt;</span>
          </div>

        
        {/* <ul>
            <li className='flex gap-4'>
                <a className='hover:font-bold' href="/">Home</a>
                <a className='hover:font-bold' href="#">Contact</a>
                <a className='hover:font-bold' href="#">About</a>
            </li>
        </ul> */}

           <button className='text-white bg-green-700 md:mx-20 my-5 rounded-full flex justify-between items-center ring-white ring-1'>
             <img className='invert p-1 w-10' src="/icons/github.svg" alt="github logo" />
             <span className='font-bold px-2'>GitHub</span>
           </button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
