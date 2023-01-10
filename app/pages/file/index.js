import {useEffect, useRef, useState} from 'react'
import {Button, Drawer, Empty, Message, Table, Upload} from "@arco-design/web-react";
import { Layout} from "@arco-design/web-react"
import Head from "next/head";
import SideMenu from "../../components/SideMenu";

import {menuConfig} from "../../config/config.js"
import {create} from "kubo-rpc-client";

import {ethers} from "ethers";

import STORAGE_ABI from "../../../chain/artifacts/contracts/Storage.sol/Storage.json"

const Sider = Layout.Sider;
const Header = Layout.Header;
const Content = Layout.Content;

const ipfs = create({host:"ipfs.cyril.tech", port: 5001});

const storage_address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

const columns = [
    {title:"名称", dataIndex: "name"},
    {title:"类型", dataIndex: "type"},
    {title:"大小", dataIndex: "size", render: (col, record, index)=>(formatBytes(record.size))},
]

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function onFileTableRow(record, index){

    return {
        onDoubleClick: async ()=> {
            const link = document.createElement("a");
            link.href = "/ipfs/"+record.cid;
            link.download = record.name;
            link.click();
            link.remove();
        }
    }
}

export default function FileManager(){
    const [uploadVisible, setUploadVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const fileListRef = useRef();
    fileListRef.current = fileList;
    const [storage, setStorage] = useState(undefined);
    const [fileListLoading, setFileListLoading] = useState(true)

    useEffect(()=>{
        (async function (){
            setFileListLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const storage = new ethers.Contract(storage_address, STORAGE_ABI.abi, provider);
            const storageWithSinger = storage.connect(provider.getSigner());
            setStorage(storageWithSinger);
            console.log("account: "+accounts);
            const files = await storage.getAllFile();
            setFileList(files.map(file=>{
                return {
                    "id": Number(file.id._hex),
                    "cid": file.cid,
                    "name": file.name,
                    "type": file.fType,
                    "size": Number(file.size._hex)
                }
            }));
            setFileListLoading(false);
        }());
    },[])

    function uploadFile(options){
        const { onProgress, onError, onSuccess, file } = options;
        const abortController = new AbortController;
        const abortSignal = abortController.signal;
        const totalBytes = file.size;
        let fileInfo = {
            id: 0,
            cid: 0,
            name: file.name,
            path: "/",
            size: file.size,
            type: file.type?file.type:"File",
            desc: "",
            key: "no key now"
        }
        ipfs.add({
            path: "/"+file.name,
            content: file
        }, {
            progress: (byteCount)=>{onProgress((byteCount/totalBytes) * 100);},
            signal: abortSignal,
        })
        .then(async (uploaded)=>{
            fileInfo.cid = uploaded.cid.toString();
            const fid = await storage.addFile(
                fileInfo.cid,
                fileInfo.name,
                fileInfo.path,
                fileInfo.size,
                fileInfo.type,
                fileInfo.desc,
                fileInfo.key,
            );
            setFileList([...fileListRef.current, {
                id: fid,
                "name": fileInfo.name,
                "type": fileInfo.type,
                "size": fileInfo.size,
                "cid" : fileInfo.cid,
            }])
            onSuccess();
        })
        .catch(err=>{
            if(err instanceof DOMException){
                console.log("Abort Upload");
            } else{
                if(err.name === "AbortError"){
                    console.log("ipfs: upload abort");
                } else{
                    Message.error(err.message?err.message:"内部错误！");
                    console.error(err);
                    onError();
                }
            }
        });
        return {abort: ()=>{abortController.abort();}}
    }
    return (
        <>
            <Head>
                <title>Classy| 我的文件</title>
            </Head>
            <Layout>
                <Sider style={{minHeight: "100vh"}}>
                    <SideMenu menuConfig={menuConfig} defaultKey="my_file"/>
                </Sider>
                <Content style={{marginTop: '50px', marginLeft: '50px'}}>
                    <Drawer
                        width={332} title={"上传文件"}
                        visible={uploadVisible}
                        closable={false}
                        footer={null}
                        onCancel={()=>{setUploadVisible(false)}}
                    >
                        <Upload
                            drag
                            multiple
                            customRequest={uploadFile}
                        />
                    </Drawer>
                    <Button type="primary" onClick={()=>{setUploadVisible(true)}}>上传文件</Button>
                    <Table style={{marginTop:"20px", width:"90%", minWidth:"auto"}} tableLayoutFixed={true} loading={fileListLoading}
                           pagination={false}
                           rowKey='id'
                           columns={columns}
                           data={fileList}
                           onRow={onFileTableRow}
                    ></Table>
                </Content>
            </Layout>
        </>
    
    )
}