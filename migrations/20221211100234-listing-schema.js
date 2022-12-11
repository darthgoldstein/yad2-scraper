module.exports = {
  /**
   * @param {import('mongodb').Db} db
   * @param {import('mongodb').MongoClient} client
   */
  async up(db, client) {
    const now = Date.now();
    const listingCollection = db.collection('listing');
    const listings = await listingCollection.find().toArray();
    const listingsGroupedByListingId = listings.reduce((acc, listing) => {
      if (!listing.listingId) {
        return acc;
      }
      acc[listing.listingId] = acc[listing.listingId] || [];
      acc[listing.listingId].push(listing);
      return acc;
    }, {});
    const lastListingsStanding = Object.values(listingsGroupedByListingId).map(
      (groupedListings) => {
        const latestListingIndex = groupedListings
          .slice(1)
          .reduce(
            (acc, listing, i) =>
              listing.timestamp > groupedListings[acc].timestamp ? i : acc,
            0
          );
        const latestListing = groupedListings[latestListingIndex];
        latestListing.timestamp = latestListing.timestamp || now;
        return {
          listingId: latestListing.listingId,
          timestamp: latestListing.timestamp || now,
        };
      }
    );
    await listingCollection.deleteMany({});
    await listingCollection.insertMany(lastListingsStanding);
    await db.command({
      collMod: 'listing',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['listingId', 'timestamp'],
          properties: {
            listingId: {
              bsonType: 'string',
              description: 'yad2 listing ID. Doubles as link ID.',
            },
          },
        },
      },
      validationLevel: 'strict',
    });
    await listingCollection.createIndex({ listingId: 1 });
  },

  async down(db, client) {
    await db.runCommand({
      collMod: 'listing',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [],
          properties: {},
        },
      },
      validationLevel: 'moderate',
    });
  },
};
