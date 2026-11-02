/** File stored in Cloudinary */
export interface Asset {
    url: string;
    public_id: string;
}

export const assetDefinition = {
    url: String,
    public_id: String,
};
