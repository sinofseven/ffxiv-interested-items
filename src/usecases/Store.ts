import { List } from "@/models/Store";
import { Auth } from "aws-amplify";
import S3 from "aws-sdk/clients/s3";
import { AWS_REGION, DATA_BUCKET_NAME } from "@/aws-config";
import { v4 as uuidv4 } from "uuid";

const LIST_KEY = "listKey";
const CLOUD_ID_KEY = "cloudIdKey";

let client: null | S3 = null;

function loadLocalStore(): List {
  const raw = window.localStorage.getItem(LIST_KEY);
  if (raw == null) return {};
  return JSON.parse(raw);
}

function saveLocalStore(store: List) {
  const text = JSON.stringify(store);
  window.localStorage.setItem(LIST_KEY, text);
}

async function createClient(): Promise<S3> {
  if (client == null) {
    const cred = Auth.essentialCredentials(await Auth.currentCredentials());
    client = new S3({
      credentials: cred,
      region: AWS_REGION,
      signatureVersion: "v4"
    });
  }
  return client;
}

async function convertBlobToString(body: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onload = () => {
      const value = fr.result;
      if (typeof value === "string") {
        resolve(value);
      } else {
        reject(new Error("failed convert Blob to String"));
      }
    };
    fr.readAsText(body);
  });
}

async function convertBodyToString(body?: S3.Body): Promise<string> {
  if (body instanceof Buffer) {
    return body.toString();
  }
  if (body instanceof Uint8Array) {
    return new TextDecoder().decode(body);
  }
  if (body instanceof Blob) {
    return convertBlobToString(body);
  }
  throw new Error("failed convert Body to String.");
}

export async function loadCloudStore(keyId: string): Promise<List> {
  const client = await createClient();
  const resp = await client
    .getObject({
      Bucket: DATA_BUCKET_NAME,
      Key: keyId
    })
    .promise();
  const raw = await convertBodyToString(resp.Body);
  return JSON.parse(raw);
}

async function saveCloudStore(keyId: string, data: List) {
  const client = await createClient();
  await client
    .putObject({
      Bucket: DATA_BUCKET_NAME,
      Key: keyId,
      Body: JSON.stringify(data),
      ContentType: "application/json"
    })
    .promise();
}

export async function loadStore(): Promise<List> {
  const keyId = window.localStorage.getItem(CLOUD_ID_KEY);
  if (keyId == null) {
    return loadLocalStore();
  } else {
    return await loadCloudStore(keyId);
  }
}

export async function saveStore(store: List) {
  saveLocalStore(store);
  const keyId = window.localStorage.getItem(CLOUD_ID_KEY);
  if (keyId == null) return;
  await saveCloudStore(keyId, store);
}

export async function headStore(keyId: string): Promise<boolean> {
  const client = await createClient();
  try {
    await client
      .headObject({
        Bucket: DATA_BUCKET_NAME,
        Key: keyId
      })
      .promise();
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export function createCloudKeyId(): string {
  const keyId = uuidv4().toString();
  window.localStorage.setItem(CLOUD_ID_KEY, keyId);
  return keyId;
}

export function saveCloudKeyId(keyId: string) {
  window.localStorage.setItem(CLOUD_ID_KEY, keyId);
}

export function removeCloudKeyId() {
  window.localStorage.removeItem(CLOUD_ID_KEY);
}

export function getCloudKeyId(): string | null {
  return window.localStorage.getItem(CLOUD_ID_KEY);
}

export function mergeStore(storeA: List, storeB: List): List {
  const result: List = JSON.parse(JSON.stringify(storeA));
  for (const key of Object.keys(storeB)) {
    if (Object.keys(result).includes(key)) {
      const raw_ids = result[key].concat(storeB[key]);
      result[key] = Array.from(new Set(raw_ids));
    } else {
      result[key] = storeB[key];
    }
  }
  return result;
}
