import { getListings, getListingById, getListingsByPropertyType, getListingsWithTotalPrice, getListingsByHostId, setListingAvailability, getTopHosts } from "../services/listingsService.js";

export const getAllListings = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : undefined;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : undefined;
        const listings = await getListings(page, pageSize);
        res.json(listings);
    } catch (error) {
        console.log("Error fetching listings: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getListingId = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        const listing = await getListingById(id);
        res.json(listing);
    } catch (error) {
        console.log("Error fetching listing: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const AVAILABILITY_LIMITS = {
    "available_30": 30,
    "available_60": 60,
    "available_90": 90,
    "available_365": 365
};

const parsePositiveInt = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const parsePagination = (query) => {
    const {page, pageSize} = query;
    if (page === undefined && pageSize === undefined) {
        return {};
    }
    const parsedPage = parsePositiveInt(page);
    const parsedPageSize = parsePositiveInt(pageSize);
    if (!parsedPage || !parsedPageSize) {
        return { error: "page y pageSize deben enviarse juntos y ser enteros positivos" };
    }
    return { page: parsedPage, pageSize: parsedPageSize };
};

export const getListingsByType = async (req, res) => {
    try {
        const type = req.params.type.trim();
        if (!type) {
            return res.status(400).json({ message: "El tipo de alojamiento es obligatorio" });
        }
        const { page, pageSize, error } = parsePagination(req.query);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const listings = await getListingsByPropertyType(type, page, pageSize);
        res.json(listings);
    } catch (error) {
        console.log("Error fetching listings by property type: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getListingsWithPrice = async (req, res) => {
    try {
        const { page, pageSize, error } = parsePagination(req.query);   
        if (error) {
            return res.status(400).json({ message: error });
        }
        const listings = await getListingsWithTotalPrice(page, pageSize);
        res.json(listings);
    } catch (error) {
        console.log("Error fetching listings with total price: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getListingsByHost = async (req, res) => {
    try {
        const hostId = req.params.host_id.trim();
        if (!hostId) {
            return res.status(400).json({ message: "El hostId es obligatorio" });
        }
        const { page, pageSize, error } = parsePagination(req.query);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const listings = await getListingsByHostId(hostId, page, pageSize);
        res.json(listings);
    } catch (error) {
        console.log("Error fetching listings by hostId: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const patchListingAvailability = async (req, res) => {
    try {
        const body = req.body ?? {};
        const keys = Object.keys(body);
        if (keys.length === 0) {
            return res.status(400).json({ message: "Se requiere al menos un campo de disponibilidad" });
        }
        const availability = {};
        for (const key of keys) {
            const max = AVAILABILITY_LIMITS[key];
            if (max === undefined) {
                return res.status(400).json({ message: `Campo no permitido: ${key}` });
            }
            const value = body[key];
            if (!number.isInteger(value) || value < 0 || value > max) {
                return res.status(400).json({ message: `El valor de ${key} debe ser un entero entre 0 y ${max}` });
            }
            availability[key] = value;
        }
        const listing = await setListingAvailability(req.params.id, availability);
        if (!listing) {
            return res.status(404).json({ message: "Propiedad no encontrada" });
        }
        res.json(listing);
    } catch (error) {
        console.log("Error updating listing availability: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getHostRanking = async (req, res) => {
    try {
        const limit = req.query.limit === undefined ? 10 : parsePositiveInt(req.query.limit);
        if (!limit) {
            return res.status(400).json({ message: "limit debe ser un entero positivo" });
        }
        const hosts = await getTopHosts(limit);
        res.json(hosts);
    } catch (error) {
        console.log("Error fetching top hosts: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};