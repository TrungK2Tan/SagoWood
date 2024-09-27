import React from 'react';


const Input =({
    name = '',
    className='',
    label = '',
    type='text',
    placeholder = '',
    value = '',
    onChange = () =>null,
    onKeyDown,
    isRequired = true
}) =>{
    return(
        <div class="mb-4">
            {
                label &&
                <label class="block text-gray-700 text-sm font-bold mb-2 " for={name}>
                    {label}
                </label>
            }
            <input className={`shadow appearance-none border  w-full py-2 px-3 text-gray-700 leading-tight  focus:outline-none focus:shadow-outline ${className}`} id={name}
            value={value} onChange={onChange} onKeyDown={onKeyDown} type={type} placeholder={placeholder} required={isRequired}/>
        </div>
    )
}
export default Input