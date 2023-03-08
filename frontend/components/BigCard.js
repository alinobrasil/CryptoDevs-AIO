import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

function BigCard({
    title = "Whitelist",
    description = "Whitelist your address to participate in the sale",
    image = "/guest-list.png",
    path = "/whitelist"
}) {
    return (
        <Link href={path}>
            <div style={{
                border: "1px solid black",
                borderRadius: "10px",
                padding: "30px",
                width: "450px",
                margin: "20px",
            }}>

                <h2 style={{
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'center',
                    textAlign: "center",
                    color: "purple"
                }}>{title}</h2>

                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}>
                    <Image src={image} width='100' height='100' />
                    <p style={{
                        padding: "20px",
                    }}> {description}</p>
                </div>
            </div>
        </Link>
    )
}

export default BigCard