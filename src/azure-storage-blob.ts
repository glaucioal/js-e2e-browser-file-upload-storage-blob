// ./src/azure-storage-blob.ts

// <snippet_package>
// THIS IS SAMPLE CODE ONLY - NOT MEANT FOR PRODUCTION USE
import { BlobServiceClient, ContainerClient} from '@azure/storage-blob';

// THIS IS SAMPLE CODE ONLY - DON'T STORE TOKEN IN PRODUCTION CODE
const sasToken = process.env.storagesastoken || "sv=2019-12-12&ss=b&srt=sco&sp=rwdlacx&se=2020-12-29T03:49:29Z&st=2020-12-28T19:49:29Z&spr=https&sig=ciQh9T2dQvY%2BqQg1JmAqzpNMHvasFJmV8oJ7KR8N4ac%3D"; // Fill string with your SAS token
const containerName = `tutorial-container`;
const storageAccountName = process.env.storageresourcename || "fileuploadglaucio"; // Fill string with your Storage resource name
// </snippet_package>

// <snippet_isStorageConfigured>
// Feature flag - disable storage feature to app if not configured
export const isStorageConfigured = () => {
  return (!storageAccountName || !sasToken) ? false : true;
}
// </snippet_isStorageConfigured>

// <snippet_getBlobsInContainer>
// return list of blobs in container to display
const getBlobsInContainer = async (containerClient: ContainerClient) => {
  const returnedBlobUrls: string[] = [];

  // get list of blobs in container
  // eslint-disable-next-line
  for await (const blob of containerClient.listBlobsFlat()) {
    // if image is public, just construct URL
    returnedBlobUrls.push(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
    );
  }

  return returnedBlobUrls;
}
// </snippet_getBlobsInContainer>

// <snippet_createBlobInContainer>
const createBlobInContainer = async (containerClient: ContainerClient, file: File) => {
  
  // create blobClient for container
  const blobClient = containerClient.getBlockBlobClient(file.name);

  // set mimetype as determined from browser with file upload control
  const options = { blobHTTPHeaders: { blobContentType: file.type } };

  // upload file
  await blobClient.uploadBrowserData(file, options);
}
// </snippet_createBlobInContainer>

const createContainer = async (): Promise<ContainerClient> => {
  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient = blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: 'container',
  });

  return containerClient;
};

// <snippet_uploadFileToBlob>
const uploadFileToBlob = async (file: File | null): Promise<string[]> => {
  if (!file) return [];

  const containerClient: ContainerClient = await createContainer();

  // upload file
  await createBlobInContainer(containerClient, file);

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};

export const getListOfFiles = async (): Promise<string[]> => {

  const containerClient: ContainerClient = await createContainer();

  return getBlobsInContainer(containerClient);

};
// </snippet_uploadFileToBlob>

export default uploadFileToBlob;

