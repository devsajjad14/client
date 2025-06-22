import { relations } from "drizzle-orm/relations";
import { users, addresses, sessions, userProfiles, products, productImages, reviews, accounts } from "./schema";

export const addressesRelations = relations(addresses, ({one}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	addresses: many(addresses),
	sessions: many(sessions),
	userProfiles: many(userProfiles),
	reviews: many(reviews),
	accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.id],
		references: [users.id]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	productImages: many(productImages),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));