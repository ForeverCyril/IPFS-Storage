import {create} from "kubo-rpc-client";

const ipfs = create({host:"ipfs.cyril.tech", port: 5001});
export default async function handler(req, resp) {
    const {cid, name} = req.query;
    resp.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    resp.sendHeaders();
    resp.wri
}
