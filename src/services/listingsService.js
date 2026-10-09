import { findAllListings, findListingById, findLListingsByPropertyType, findListingsWithTotalPrice, findListingsByHostId, updateListingAvailability, findTopHosts } from "../data/listingsData.js";

export const getListings = async (page, pageSize) => {
    return await findAllListings(page, pageSize);
}

export const getListingById = async (id) => {
    return await findListingById(id);
}

export const getListingsByPropertyType = async (type, page, pageSize) => {
    return await findLListingsByPropertyType(type, page, pageSize);
}

export const getListingsWithTotalPrice = async (page, pageSize) => {
    return await findListingsWithTotalPrice(page, pageSize);
}

export const getListingsByHostId = async (hostId, page, pageSize) => {
    return await findListingsByHostId(hostId, page, pageSize);
}

export const setListingAvailability = async (id, availability) => {
    return await updateListingAvailability(id, availability);
}

export const getTopHosts = async (limit) => {
    return await findTopHosts(limit);
}