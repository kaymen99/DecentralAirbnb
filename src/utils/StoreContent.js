import { Web3Storage } from "web3.storage";

const web3storage_key = "YOUR-WEB3.STORAGE-API-TOKEN";

function GetAccessToken() {
  return web3storage_key;
}

function MakeStorageClient() {
  return new Web3Storage({ token: GetAccessToken() });
}

export const StoreContent = async (files) => {
  console.log("Uploading files to IPFS with web3.storage....");
  const client = MakeStorageClient();
  const cid = await client.put([files]);
  console.log("Stored files with cid:", cid);
  return cid;
};
