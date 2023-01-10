import { Typography, Menu } from "@arco-design/web-react"
import Link from 'next/link'

const MenuItem = Menu.Item;

export default function SideMenu({ menuConfig, defaultKey }) {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div className='logo' style={{
                height: "32px",
                margin: "12px 8px",
                marginBottom: "100px",
                background: "rgba(255, 255, 255, 0.2)",
            }}>
                <Typography>
                    <Typography.Title copyable={false} style={{ "textAlign": "center" }}>Classy</Typography.Title>
                </Typography>
            </div>
            <Menu defaultSelectedKeys={defaultKey}>
                {menuConfig.map((item) => {
                    return (
                        <MenuItem key={item.key}>
                            <Link
                                style={{
                                    textDecoration: 'none',
                                    color: '#000',
                                    width:'auto',
                                    display:'block'
                                }}
                                href={item.path}
                            >
                                
                            {item.icon}
                            {item.text}
                            </Link>
                        </MenuItem>
                    )
                })}
            </Menu>
        </div>
    )
}