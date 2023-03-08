import React from 'react'
import Link from 'next/link'

function Footer() {
    return (
        <div style={{
            display: 'flex',
            padding: '2rem 0',
            borderTop: '1px solid #eaeaea',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Link href="https://twitter.com/alik_im">
                @alik_im
            </Link>
        </div>
    )
}

export default Footer