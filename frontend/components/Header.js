import MenuItem from './MenuItem'
import Link from 'next/link'

function Header() {
    return (
        <>
            <Link href='/'>
                <div style={{
                    backgroundColor: '#f7f7f7',
                    minHeight: '80px',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    padding: '1px',
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                    <img src="./crypto-devs.svg" style={{
                        height: '100px'
                    }} />

                    <h1 style={{
                        fontSize: '3em',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        Crypto Devs NFT Suite
                    </h1>
                </div>
            </Link>

            <div style={{
                height: '50px',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                padding: '10px',
                paddingTop: '13px',
                backgroundColor: 'lightblue',
            }}>
                <MenuItem path="Whitelist" label="Whitelist Signup" />
                <MenuItem path="NFT" label="NFT Minter" />
                <MenuItem label="ICO" path="/ICO" />
                <MenuItem label="DAO" path="/DAO" />
                <MenuItem label="DEX" path="/DEX" />
            </div>
        </>
    )
}

export default Header