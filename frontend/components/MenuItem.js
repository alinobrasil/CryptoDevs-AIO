import React from 'react'
import Link from 'next/link'

function MenuItem({ path = '/NFT', label = 'NFT Minter' }) {
    return (
        <Link href={`${path}`} style={{
            fontSize: '20px',
            padding: '10px',
            margin: '10px',
            fontWeight: 'bold',
        }}
        >
            {label}
        </Link >

    )
}

export default MenuItem