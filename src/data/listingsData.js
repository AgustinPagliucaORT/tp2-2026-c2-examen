import { getDb } from "./connection.js";

export async function findAllListings(page, pageSize) {
    const db = getDb();
    if (page && pageSize) {
        const skip = (page - 1) * pageSize;
        const listings = await db.collection("listingsAndReviews")
            .find()
            .skip(skip)
            .limit(pageSize)
            .toArray();
        return listings;
    } else {
        // Sin paginación: trae todos los documentos
        const listings = await db.collection("listingsAndReviews").find().toArray();
        return listings;
    }
}

export async function findListingById(id) {
    const db = getDb();
    const listing = await db.collection("listingsAndReviews").findOne({ _id: id });
    console.log(listing);
    return listing;
}

export async function findLListingsByPropertyType(type, page, pageSize) {
    const db = getDb();
    const cursor = db.collection("listingsAndReviews").find({ property_type: type });
    if (page && pageSize) {
        cursor.skip((page - 1) * pageSize).limit(pageSize); 
    }
    return await cursor.toArray();
}

export async function findListingsWithTotalPrice(page, pageSize) {
    const db = getDb();
    const toNumber = (field) => ({ $convert: { input: `$${field}`, to: "double", onError: 0, onNull: 0 } });
    const pipeline = [];
    if (page && pageSize) {
        pipeline.push({ $skip: (page - 1) * pageSize }, { $limit: pageSize });
    }
    pipeline.push({
        $addFields: {
            total_price: {
                $round: [
                    { $add: [toNumber("price"), toNumber("cleaning_fee"), toNumber("security_deposit"), toNumber("$extra_people")] },
                    2
                ]
            }
        }
    });
    return await db.collection("listingsAndReviews").aggregate(pipeline).toArray();
}

export async function findListingsByHostId(hostId, page, pageSize) {
    const db = getDb();
    const cursor = db.collection("listingsAndReviews").find({ "host.host_id": hostId });
    if (page && pageSize) {
        cursor.skip((page - 1) * pageSize).limit(pageSize);
    }
    return await cursor.toArray();
}

export async function updateListingAvailability(id, availability) {
    const db = getDb();
    const fields = {};
    for (const [key, value] of Object.entries(availability)) {
        fields[`availability.${key}`] = value;
    }
    const listing = await db.collection("listingsAndReviews").findOneAndUpdate(
        { _id: id },
        { $set: fields },
        { returnDocument: "after", projection: { _id: 1, availability: 1 } }
    );
    return listing;
}

export async function findTopHosts(limit) {
    const db = getDb();
    const hosts = await db.collection("listingsAndReviews").aggregate([
        { $group: { _id: "$host.host_id", name: { $first: "$host.host_name" }, listingsCount: { $sum: 1 } } },
        { $sort: { listingsCount: -1 } },
        { $limit: limit },
        { $project: { _id: 0, host_id: "$_id", name: 1, listingsCount: 1 } }
    ]).toArray();
    return hosts;
}