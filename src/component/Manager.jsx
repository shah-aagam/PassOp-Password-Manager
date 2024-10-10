import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';

import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
    const ref = useRef();
    const passwordRef = useRef();
    const [form, setForm] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([]);
    const [characters, setCharacters] = useState([]);
    const statement = "Your own Password Manager";
    const [passwordToDelete, setPasswordToDelete] = useState(null);

    const openDeleteModal = (id) => {
        const password = passwordArray.find(item => item.id === id);
        setPasswordToDelete(password);
    };

    useEffect(() => {
        // Split the statement into characters
        const charactersArray = statement.split('');

        // Set up a timer to add each character to the array with a delay
        const timer = setInterval(() => {
            setCharacters(prevCharacters => [...prevCharacters, charactersArray[prevCharacters.length]]);
            if (charactersArray.length === characters.length) {
                clearInterval(timer);
            }
        }, 100); // Adjust the delay as needed

        return () => clearInterval(timer); // Clean up the timer
    }, []);

    useEffect(() => {
        let passwords = localStorage.getItem("passwords");
        if (passwords) {
            setPasswordArray(JSON.parse(passwords))
        }
    }, [])

    const copyText = (text) => {
        toast.success('Copied to Clipboard!', {
            theme: "light",
            autoClose: 2000,
            icon: () => <img src="/icons/copy.png" />
        });
        navigator.clipboard.writeText(text)
    }

    const showPassword = (params) => {
        passwordRef.current.type = "text"
        if (ref.current.src.includes("icons/eyecross.png")) {
            ref.current.src = "icons/eye.png"
            passwordRef.current.type = "password"

        }
        else {
            ref.current.src = "icons/eyecross.png"
            passwordRef.current.type = "text"
        }
    }

    const savePassword = (params) => {
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            setPasswordArray([...passwordArray, { ...form, id: uuidv4() }])
            localStorage.setItem("passwords", JSON.stringify([...passwordArray, { ...form, id: uuidv4() }]))
            console.log([...passwordArray, form])
            setForm({ site: "", username: "", password: "" })
            toast.success('Password saved successfully!', {
                theme: "colored",
                autoClose: 2000,
            });
        }
        else {
            toast.error('Atleast 4 characters required in each field !', {
                autoClose: 4000,
            });
        }
    }

    const editPassword = (id) => {
        console.log("Editing password with id", id)
        setForm(passwordArray.filter(item => item.id === id)[0])
        setPasswordArray(passwordArray.filter(item => item.id !== id))
    }

    const deletePassword = (id) => {
        setPasswordArray(prevPasswords => prevPasswords.filter(item => item.id !== id));
        localStorage.setItem("passwords", JSON.stringify(passwordArray.filter(item => item.id !== id)));
        toast.error("Password Deleted!", {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
            icon: () => <img className='invert' src="/icons/delete.png" />
        });
        // Clear the password to delete after deletion
        setPasswordToDelete(null);
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    return (
        <>
            <ToastContainer />

            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div></div>




            <div className="p-2 md:p-0 md:mycontainer md:w-[900px]">
                <h1 className='p-2 text-4xl text font-bold text-center'>
                    <span className='text-green-500'> &lt;</span>
                    Pass
                    <span className='text-green-500'>OP/ &gt;</span>
                </h1>
                <div className='text-green-500 text-center'>
                    <div>
                        {characters.map((char, index) => (
                            <span className='text-2xl' key={index}>{char}</span>
                        ))}
                    </div>
                </div>

                <div className=' flex flex-col p-4 text-black gap-8 items-center'>
                    <input value={form.site} placeholder='Enter website URL/name' onChange={handleChange} className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name='site' id='site' />
                    <div className='flex flex-col md:flex-row gap-8 w-full justify-between'>
                        <input value={form.username} placeholder='Enter username' onChange={handleChange} className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name='username' id='username' />
                        <div className="relative">

                            <input ref={passwordRef} value={form.password} placeholder='Enter password' onChange={handleChange} className='rounded-full border border-green-500 w-full p-4 py-1' type="password" name='password' id='password' />
                            <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={26} src="icons/eye.png" alt="eye" />
                            </span>
                        </div>
                    </div>
                    <button onClick={savePassword} className=' flex justify-center items-center gap-4 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-black' >
                        <lord-icon
                            src="https://cdn.lordicon.com/jgnvfzqg.json"
                            trigger="hover">
                        </lord-icon>
                        Save </button>
                </div>

                <div className="passwords">
                    <h2 className='text-center text-2xl font-bold py-1'>Your passwords</h2>
                    {passwordArray.length === 0 && <div>No passwords to show </div>}
                    {passwordArray.length != 0 && <table className="table-auto w-full rounded-md overflow-hidden">
                        <thead className='bg-green-800 text-center text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                                <th className='py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-green-100'>
                            {passwordArray.map((item, index) => {
                                return <tr key={index}>
                                    <td className=' py-2 border border-white text-center '>
                                        <div className='flex justify-center items-center'>
                                            <a href={item.site} target='_blank'>{item.site}</a>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.site) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover">
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className=' py-2 border border-white text-center '>
                                        <div className='flex justify-center items-center'>
                                            <span>{item.username}</span>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.username) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover">
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 items-center justify-center border border-white text-center '>
                                        <div className="flex justify-center items-center">
                                            <span>{"*".repeat(item.password.length)}</span>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.password) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover">
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className=' py-2 border border-white text-center w-32'>
                                        <span className='mx-2 cursor-pointer' onClick={() => { editPassword(item.id) }}>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/gwlusjdu.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                        </span>
                                        <span className='mx-2 cursor-pointer' onClick={() => openDeleteModal(item.id)}>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/skkahier.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                        </span>
                                    </td>
                                </tr>

                            })}
                        </tbody>
                    </table>}
                </div>
                {/* Render a separate modal for each password */}
                {passwordToDelete && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <h1 className="modal-title">Confirm to delete your password</h1>
                                {/* <button className="modal-close" onClick={() => setPasswordToDelete(null)}>×</button> */}
                            </div>
                            <div className="modal-body">
                                <p><span className='font-bold text-[#333]'>Site</span>: {passwordToDelete.site}</p>
                                <div className='flex flex-row gap-4 text-center justify-center'>
                                    <p><span className='font-bold text-[#333]'>Username</span>: {passwordToDelete.username}</p>
                                    <p><span className='font-bold text-[#333]'>Password</span>: {passwordToDelete.password}</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setPasswordToDelete(null)}>Close</button>
                                <button className="btn btn-primary bg-red-500 hover:bg-red-700" onClick={() => deletePassword(passwordToDelete.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    )
}

export default Manager
