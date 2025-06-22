import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { taxonomy, attributes, attributeValues, brands, products, productAlternateImages, productVariations, settings, apiIntegrations, users, userProfiles, addresses, dataModeSettings, coupons, reviews, orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import seed from '@/app/admin/seed/seed.json';

type ResultStatus = 'idle' | 'working' | 'completed' | 'skipped' | 'error';

interface Result {
  status: ResultStatus;
  message: string;
  count: number;
}

export async function POST() {
  const results: Record<string, Result> = {
    taxonomy: { status: 'idle', message: '', count: 0 },
    attributes: { status: 'idle', message: '', count: 0 },
    attribute_values: { status: 'idle', message: '', count: 0 },
    brands: { status: 'idle', message: '', count: 0 },
    products: { status: 'idle', message: '', count: 0 },
    product_alternate_images: { status: 'idle', message: '', count: 0 },
    product_variations: { status: 'idle', message: '', count: 0 },
    settings: { status: 'idle', message: '', count: 0 },
    api_integration: { status: 'idle', message: '', count: 0 },
    users: { status: 'idle', message: '', count: 0 },
    user_profiles: { status: 'idle', message: '', count: 0 },
    addresses: { status: 'idle', message: '', count: 0 },
    data_mode_settings: { status: 'idle', message: '', count: 0 },
    coupons: { status: 'idle', message: '', count: 0 },
    reviews: { status: 'idle', message: '', count: 0 },
    orders: { status: 'idle', message: '', count: 0 },
    order_items: { status: 'idle', message: '', count: 0 }
  };

  try {
    console.log('Starting seed data creation...');

    try {
      // Check if taxonomy table has data
      const existingTaxonomy = await db.select().from(taxonomy);
      if (existingTaxonomy.length > 0) {
        console.log('Taxonomy table already has data. Skipping insertion.');
        results.taxonomy = {
          status: 'skipped',
          message: 'Taxonomy table already has data',
          count: existingTaxonomy.length
        };
      } else {
        // Insert taxonomy
        console.log('Starting taxonomy data insertion...');
        try {
          const taxonomyData = seed.taxonomy.map(item => ({
            DEPT: item.DEPT,
            WEB_URL: item.WEB_URL,
            WEB_TAXONOMY_ID: item.WEB_TAXONOMY_ID,
            TYP: item.TYP,
            SUBTYP_1: item.SUBTYP_1,
            SUBTYP_2: item.SUBTYP_2,
            SUBTYP_3: item.SUBTYP_3,
            SORT_POSITION: item.SORT_POSITION,
            LONG_DESCRIPTION: item.LONG_DESCRIPTION,
            DLU: new Date(item.DLU),
            CATEGORY_STYLE: item.CATEGORY_STYLE,
            SHORT_DESC: item.SHORT_DESC,
            LONG_DESCRIPTION_2: item.LONG_DESCRIPTION_2,
            META_TAGS: item.META_TAGS,
            BACKGROUNDIMAGE: item.BACKGROUNDIMAGE,
            SHORT_DESC_ON_PAGE: item.SHORT_DESC_ON_PAGE,
            GOOGLEPRODUCTTAXONOMY: item.GOOGLEPRODUCTTAXONOMY,
            CATEGORYTEMPLATE: item.CATEGORYTEMPLATE,
            BESTSELLERBG: item.BESTSELLERBG,
            NEWARRIVALBG: item.NEWARRIVALBG,
            PAGEBGCOLOR: item.PAGEBGCOLOR
          }));

          await db.insert(taxonomy).values(taxonomyData);
          results.taxonomy = {
            status: 'completed',
            message: `Successfully created ${taxonomyData.length} taxonomy records`,
            count: taxonomyData.length
          };
          console.log('Taxonomy data insertion completed successfully');
        } catch (error) {
          console.error('Taxonomy data insertion failed:', error);
          results.taxonomy = {
            status: 'error',
            message: 'Failed to create taxonomy records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create taxonomy records',
            results
          }, { status: 500 });
        }
      }

      // Check if attributes table has data
      const existingAttributes = await db.select().from(attributes);
      if (existingAttributes.length > 0) {
        console.log('Attributes table already has data. Skipping insertion.');
        results.attributes = {
          status: 'skipped',
          message: 'Attributes table already has data',
          count: existingAttributes.length
        };
      } else {
        // Insert attributes
        console.log('Starting attributes data insertion...');
        try {
          const attributesData = seed.attributes.map(item => ({
            name: item.name,
            display: item.display,
            status: item.status,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
          }));

          await db.insert(attributes).values(attributesData);
          results.attributes = {
            status: 'completed',
            message: `Successfully created ${attributesData.length} attribute records`,
            count: attributesData.length
          };
          console.log('Attributes data insertion completed successfully');
        } catch (error) {
          console.error('Attributes data insertion failed:', error);
          results.attributes = {
            status: 'error',
            message: 'Failed to create attribute records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create attribute records',
            results
          }, { status: 500 });
        }
      }

      // Check if attribute values table has data
      const existingAttributeValues = await db.select().from(attributeValues);
      console.log('Checking attribute values table...', { count: existingAttributeValues.length });
      if (existingAttributeValues.length > 0) {
        console.log('Attribute values table already has data. Skipping insertion.');
        results.attribute_values = {
          status: 'skipped',
          message: 'Attribute values table already has data',
          count: existingAttributeValues.length
        };
      } else {
        // Insert attribute values
        console.log('Starting attribute values data insertion...');
        try {
          // Get all attributes from the database to map IDs
          const dbAttributes = await db.select().from(attributes);
          console.log('Found attributes in database:', { count: dbAttributes.length });
          const attributeIdMap = new Map(
            dbAttributes.map(attr => [attr.name, attr.id])
          );

          const attributeValuesData = seed.attribute_values.map(item => {
            // Find the attribute by ID in the seed data
            const attribute = seed.attributes.find(attr => attr.id === item.attribute_id);
            if (!attribute) {
              throw new Error(`Attribute with ID ${item.attribute_id} not found in seed data`);
            }
            // Get the new attribute ID from our map
            const newAttributeId = attributeIdMap.get(attribute.name);
            if (!newAttributeId) {
              throw new Error(`Attribute ${attribute.name} not found in inserted attributes`);
            }
            return {
              attributeId: newAttributeId,
              value: item.value,
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.updated_at)
            };
          });

          console.log('Prepared attribute values data:', { count: attributeValuesData.length });
          await db.insert(attributeValues).values(attributeValuesData);
          results.attribute_values = {
            status: 'completed',
            message: `Successfully created ${attributeValuesData.length} attribute value records`,
            count: attributeValuesData.length
          };
          console.log('Attribute values data insertion completed successfully');
        } catch (error) {
          console.error('Attribute values data insertion failed:', error);
          results.attribute_values = {
            status: 'error',
            message: 'Failed to create attribute values',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create attribute values',
            results
          }, { status: 500 });
        }
      }

      // Check if brands table has data
      const existingBrands = await db.select().from(brands);
      if (existingBrands.length > 0) {
        console.log('Brands table already has data. Skipping insertion.');
        results.brands = {
          status: 'skipped',
          message: 'Brands table already has data',
          count: existingBrands.length
        };
      } else {
        // Insert brands
        console.log('Starting brands data insertion...');
        try {
          const brandsData = seed.brands.map(item => ({
            name: item.name,
            urlHandle: item.url_handle,
            alias: item.alias,
            description: item.description,
            logo: item.logo,
            showOnCategory: item.show_on_category,
            showOnProduct: item.show_on_product,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            status: item.status
          }));

          await db.insert(brands).values(brandsData);
          results.brands = {
            status: 'completed',
            message: `Successfully created ${brandsData.length} brand records`,
            count: brandsData.length
          };
          console.log('Brands data insertion completed successfully');
        } catch (error) {
          console.error('Brands data insertion failed:', error);
          results.brands = {
            status: 'error',
            message: 'Failed to create brand records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create brand records',
            results
          }, { status: 500 });
        }
      }

      // Check if products table has data
      const existingProducts = await db.select().from(products);
      if (existingProducts.length > 0) {
        console.log('Products table already has data. Skipping insertion.');
        results.products = {
          status: 'skipped',
          message: 'Products table already has data',
          count: existingProducts.length
        };
      } else {
        // Insert products
        console.log('Starting products data insertion...');
        try {
          const productsData = seed.products.map(item => ({
            styleId: item.style_id,
            name: item.name,
            style: item.style,
            quantityAvailable: item.quantity_available,
            onSale: item.on_sale === 'Y',
            isNew: item.is_new === 'Y',
            smallPicture: item.small_picture,
            mediumPicture: item.medium_picture,
            largePicture: item.large_picture,
            dept: item.dept,
            typ: item.typ,
            subtyp: item.subtyp,
            brand: item.brand,
            sellingPrice: parseFloat(item.selling_price),
            regularPrice: parseFloat(item.regular_price),
            longDescription: item.long_description,
            of7: item.of7,
            of12: item.of12,
            of13: item.of13,
            of15: item.of15,
            forceBuyQtyLimit: item.force_buy_qty_limit,
            lastRcvd: new Date(item.last_rcvd),
            tags: item.tags,
            urlHandle: item.url_handle,
            barcode: item.barcode,
            sku: item.sku,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            trackInventory: item.track_inventory,
            stockQuantity: item.stock_quantity,
            continueSellingOutOfStock: item.continue_selling_out_of_stock,
            lowStockThreshold: item.low_stock_threshold
          }));

          const insertedProducts = await db.insert(products).values(productsData).returning();
          results.products = {
            status: 'completed',
            message: `Successfully created ${insertedProducts.length} product records`,
            count: insertedProducts.length
          };
          console.log('Products data insertion completed successfully');
        } catch (error) {
          console.error('Products data insertion failed:', error);
          results.products = {
            status: 'error',
            message: 'Failed to create product records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create product records',
            results
          }, { status: 500 });
        }
      }

      // Check if product alternate images table has data
      const existingProductAlternateImages = await db.select().from(productAlternateImages);
      if (existingProductAlternateImages.length > 0) {
        console.log('Product alternate images table already has data. Skipping insertion.');
        results.product_alternate_images = {
          status: 'skipped',
          message: 'Product alternate images table already has data',
          count: existingProductAlternateImages.length
        };
      } else {
        // Insert product alternate images
        console.log('Starting product alternate images data insertion...');
        try {
          // Get all products (either existing or newly inserted)
          const allProducts = await db.select().from(products);
          console.log('Total products found:', allProducts.length);

          // Create a map of style_id to product id
          const productIdMap = new Map(allProducts.map(p => [p.styleId, p.id]));
          console.log('Product ID Map:', Object.fromEntries(productIdMap));

          // Delete existing product alternate images
          console.log('Deleting existing product alternate images...');
          await db.delete(productAlternateImages);
          console.log('Existing product alternate images deleted successfully');

          // Insert product alternate images
          const alternateImagesData = seed.product_alternate_image.map(item => {
            const styleId = parseInt(item.product_id);
            const productId = productIdMap.get(styleId);
            console.log('Processing alternate image for style_id:', styleId);
            console.log('Found product ID:', productId);
            if (!productId) {
              throw new Error(`Product with style_id ${styleId} not found`);
            }
            return {
              productId,
              AltImage: item.medium_alt_picture,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          });

          if (alternateImagesData.length > 0) {
            const insertedAlternateImages = await db.insert(productAlternateImages).values(alternateImagesData).returning();
            results.product_alternate_images = {
              status: 'completed',
              message: `Successfully created ${insertedAlternateImages.length} product alternate image records`,
              count: insertedAlternateImages.length
            };
            console.log('Product alternate images data insertion completed successfully');
          } else {
            results.product_alternate_images = {
              status: 'skipped',
              message: 'No product alternate images to insert',
              count: 0
            };
            console.log('No product alternate images to insert');
          }
        } catch (error) {
          console.error('Product alternate images data insertion failed:', error);
          results.product_alternate_images = {
            status: 'error',
            message: 'Failed to create product alternate image records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create product alternate image records',
            results
          }, { status: 500 });
        }
      }

      // Check if settings table has data
      const existingSettings = await db.select().from(settings);
      if (existingSettings.length > 0) {
        console.log('Settings table already has data. Skipping insertion.');
        results.settings = {
          status: 'skipped',
          message: 'Settings table already has data',
          count: existingSettings.length
        };
      } else {
        // Insert settings
        console.log('Starting settings data insertion...');
        try {
          const settingsData = seed.settings.map(item => ({
            id: item.id,
            key: item.key,
            value: item.value,
            type: item.type,
            group: item.group,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
          }));

          await db.insert(settings).values(settingsData);
          results.settings = {
            status: 'completed',
            message: `Successfully created ${settingsData.length} settings records`,
            count: settingsData.length
          };
          console.log('Settings data insertion completed successfully');
        } catch (error) {
          console.error('Settings data insertion failed:', error);
          results.settings = {
            status: 'error',
            message: 'Failed to create settings records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create settings records',
            results
          }, { status: 500 });
        }
      }

      // Check if api_integration table has data
      const existingApiIntegrations = await db.select().from(apiIntegrations);
      if (existingApiIntegrations.length > 0) {
        console.log('API Integration table already has data. Skipping insertion.');
        results.api_integration = {
          status: 'skipped',
          message: `API Integration table already has data`,
          count: existingApiIntegrations.length
        };
      } else {
        // Insert api_integration
        console.log('Starting API Integration data insertion...');
        try {
          const apiIntegrationData = seed.api_integration.map(item => ({
            name: item.name,
            customerName: item.customer_name,
            customerPassword: item.customer_password,
            apiKey: item.api_key,
            apiSecret: item.api_secret,
            token: item.token,
            refreshToken: item.refresh_token,
            additionalFields: item.additional_fields,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
          }));

          await db.insert(apiIntegrations).values(apiIntegrationData);
          results.api_integration = {
            status: 'completed',
            message: `Successfully created API integration records`,
            count: apiIntegrationData.length
          };
          console.log('API Integration data insertion completed successfully');
        } catch (error) {
          console.error('API Integration data insertion failed:', error);
          results.api_integration = {
            status: 'error',
            message: 'Failed to create API integration records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create API integration records',
            results
          }, { status: 500 });
        }
      }

      // Check if users table has data
      const existingUsers = await db.select().from(users);
      if (existingUsers.length > 0) {
        console.log('Users table already has data. Skipping insertion.');
        results.users = {
          status: 'skipped',
          message: 'Users table already has data',
          count: existingUsers.length
        };
      } else {
        // Insert users
        console.log('Starting users data insertion...');
        try {
          const userData = seed.users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
            image: user.image
          }));

          await db.insert(users).values(userData);
          results.users = {
            status: 'completed',
            message: 'Successfully created user records',
            count: userData.length
          };
          console.log('Users data insertion completed successfully');
        } catch (error) {
          console.error('Users data insertion failed:', error);
          results.users = {
            status: 'error',
            message: 'Failed to create user records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create user records',
            results
          }, { status: 500 });
        }
      }

      // Check if user_profiles table has data
      const existingUserProfiles = await db.select().from(userProfiles);
      if (existingUserProfiles.length > 0) {
        console.log('User profiles table already has data. Skipping insertion.');
        results.user_profiles = {
          status: 'skipped',
          message: 'User profiles table already has data',
          count: existingUserProfiles.length
        };
      } else {
        // Insert user profiles
        console.log('Starting user profiles data insertion...');
        try {
          const userProfileData = seed.user_profiles.map(profile => ({
            id: profile.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            phone: profile.phone,
            avatarUrl: profile.avatar_url,
            updatedAt: new Date(profile.updated_at),
            isActive: profile.is_active,
            newsletterOptin: profile.newsletter_optin
          }));

          await db.insert(userProfiles).values(userProfileData);
          results.user_profiles = {
            status: 'completed',
            message: 'Successfully created user profile records',
            count: userProfileData.length
          };
          console.log('User profiles data insertion completed successfully');
        } catch (error) {
          console.error('User profiles data insertion failed:', error);
          results.user_profiles = {
            status: 'error',
            message: 'Failed to create user profile records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create user profile records',
            results
          }, { status: 500 });
        }
      }

      // Check if addresses table has data
      const existingAddresses = await db.select().from(addresses);
      if (existingAddresses.length > 0) {
        console.log('Addresses table already has data. Skipping insertion.');
        results.addresses = {
          status: 'skipped',
          message: 'Addresses table already has data',
          count: existingAddresses.length
        };
      } else {
        // Insert addresses
        console.log('Starting addresses data insertion...');
        try {
          const addressData = seed.addresses.map(address => ({
            id: address.id,
            userId: address.user_id,
            type: address.type,
            isDefault: address.is_default,
            street: address.street,
            street2: address.street_2,
            city: address.city,
            state: address.state,
            postalCode: address.postal_code,
            country: address.country,
            createdAt: new Date(address.created_at),
            updatedAt: new Date(address.updated_at)
          }));

          await db.insert(addresses).values(addressData);
          results.addresses = {
            status: 'completed',
            message: 'Successfully created address records',
            count: addressData.length
          };
          console.log('Addresses data insertion completed successfully');
        } catch (error) {
          console.error('Addresses data insertion failed:', error);
          results.addresses = {
            status: 'error',
            message: 'Failed to create address records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create address records',
            results
          }, { status: 500 });
        }
      }

      // Check if data_mode_settings table has data
      const existingDataModeSettings = await db.select().from(dataModeSettings);
      if (existingDataModeSettings.length > 0) {
        console.log('Data mode settings table already has data. Skipping insertion.');
        results.data_mode_settings = {
          status: 'skipped',
          message: 'Data mode settings table already has data',
          count: existingDataModeSettings.length
        };
      } else {
        // Insert data_mode_settings
        console.log('Starting data mode settings data insertion...');
        try {
          const dataModeSettingsData = seed.data_mode_settings.map(setting => ({
            id: setting.id,
            mode: setting.mode as 'local' | 'remote',
            endpoints: setting.endpoints,
            createdAt: new Date(setting.created_at),
            updatedAt: new Date(setting.updated_at)
          }));

          await db.insert(dataModeSettings).values(dataModeSettingsData);
          results.data_mode_settings = {
            status: 'completed',
            message: 'Successfully created data mode settings records',
            count: dataModeSettingsData.length
          };
          console.log('Data mode settings data insertion completed successfully');
        } catch (error) {
          console.error('Data mode settings data insertion failed:', error);
          results.data_mode_settings = {
            status: 'error',
            message: 'Failed to create data mode settings records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create data mode settings records',
            results
          }, { status: 500 });
        }
      }

      // Check if coupons table has data
      const existingCoupons = await db.select().from(coupons);
      if (existingCoupons.length > 0) {
        console.log('Coupons table already has data. Skipping insertion.');
        results.coupons = {
          status: 'skipped',
          message: 'Coupons table already has data',
          count: existingCoupons.length
        };
      } else {
        // Insert coupons
        console.log('Starting coupons data insertion...');
        try {
          const couponData = seed.coupons.map(coupon => ({
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            minPurchaseAmount: coupon.min_purchase_amount,
            maxDiscountAmount: coupon.max_discount_amount,
            startDate: new Date(coupon.start_date),
            endDate: new Date(coupon.end_date),
            usageLimit: coupon.usage_limit,
            usageCount: coupon.usage_count,
            perCustomerLimit: coupon.per_customer_limit,
            isActive: coupon.is_active,
            isFirstTimeOnly: coupon.is_first_time_only,
            isNewCustomerOnly: coupon.is_new_customer_only,
            excludedProducts: coupon.excluded_products,
            excludedCategories: coupon.excluded_categories,
            includedProducts: coupon.included_products,
            includedCategories: coupon.included_categories,
            customerGroups: coupon.customer_groups,
            createdAt: new Date(coupon.created_at),
            updatedAt: new Date(coupon.updated_at),
            createdBy: coupon.created_by,
            updatedBy: coupon.updated_by,
            metadata: coupon.metadata,
            analytics: coupon.analytics
          }));

          await db.insert(coupons).values(couponData);
          results.coupons = {
            status: 'completed',
            message: 'Successfully created coupon records',
            count: couponData.length
          };
          console.log('Coupons data insertion completed successfully');
        } catch (error) {
          console.error('Coupons data insertion failed:', error);
          results.coupons = {
            status: 'error',
            message: 'Failed to create coupon records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create coupon records',
            results
          }, { status: 500 });
        }
      }

      // Check if reviews table has data
      const existingReviews = await db.select().from(reviews);
      if (existingReviews.length > 0) {
        console.log('Reviews table already has data. Skipping insertion.');
        results.reviews = {
          status: 'skipped',
          message: 'Reviews table already has data',
          count: existingReviews.length
        };
      } else {
        // Insert reviews
        console.log('Starting reviews data insertion...');
        try {
          // First, get all existing users
          const existingUsers = await db.select().from(users);
          if (existingUsers.length === 0) {
            console.log('No users found. Skipping reviews insertion.');
            results.reviews = {
              status: 'skipped',
              message: 'No users found to create reviews',
              count: 0
            };
          } else {
            // Get existing products
            const existingProducts = await db.select().from(products);
            if (existingProducts.length === 0) {
              console.log('No products found. Skipping reviews insertion.');
              results.reviews = {
                status: 'skipped',
                message: 'No products found to create reviews',
                count: 0
              };
            } else {
              // Create reviews only for existing users and products
              const reviewData = seed.reviews
                .filter((_, index) => index < Math.min(existingUsers.length, existingProducts.length)) // Limit to number of users/products
                .map((review, index) => ({
                  id: review.id,
                  userId: existingUsers[index].id, // Use actual user ID
                  productId: existingProducts[index].id.toString(), // Use actual product ID
                  rating: review.rating,
                  title: review.title,
                  content: review.content,
                  images: review.images,
                  verifiedPurchase: review.verified_purchase,
                  helpfulVotes: review.helpful_votes,
                  createdAt: new Date(review.created_at),
                  updatedAt: new Date(review.updated_at)
                }));

              await db.insert(reviews).values(reviewData);
              results.reviews = {
                status: 'completed',
                message: 'Successfully created review records',
                count: reviewData.length
              };
              console.log('Reviews data insertion completed successfully');
            }
          }
        } catch (error) {
          console.error('Reviews data insertion failed:', error);
          results.reviews = {
            status: 'error',
            message: 'Failed to create review records',
            count: 0
          };
          return NextResponse.json({ 
            message: 'Seed data creation failed',
            error: 'Failed to create review records',
            results
          }, { status: 500 });
        }
      }

      // Create orders and order items
      console.log('Starting orders and order items creation...');
      try {
        // Check if orders table has data
        const existingOrders = await db.select().from(orders);
        if (existingOrders.length > 0) {
          console.log('Orders table already has data. Skipping insertion.');
          results.orders = {
            status: 'skipped',
            message: 'Orders table already has data',
            count: existingOrders.length
          };
          results.order_items = {
            status: 'skipped',
            message: 'Order items table already has data',
            count: existingOrders.length
          };
        } else {
          // Get some users for orders
          const existingUsers = await db.select().from(users).limit(5);
          if (existingUsers.length === 0) {
            console.log('No users found. Skipping orders creation.');
            results.orders = {
              status: 'skipped',
              message: 'No users found for orders',
              count: 0
            };
            results.order_items = {
              status: 'skipped',
              message: 'No users found for order items',
              count: 0
            };
          } else {
            // Get some addresses for orders
            const existingAddresses = await db.select().from(addresses).limit(5);
            if (existingAddresses.length === 0) {
              console.log('No addresses found. Skipping orders creation.');
              results.orders = {
                status: 'skipped',
                message: 'No addresses found for orders',
                count: 0
              };
              results.order_items = {
                status: 'skipped',
                message: 'No addresses found for order items',
                count: 0
              };
            } else {
              // Get some products for order items
              const existingProducts = await db.select().from(products).limit(20);
              if (existingProducts.length === 0) {
                console.log('No products found. Skipping orders creation.');
                results.orders = {
                  status: 'skipped',
                  message: 'No products found for orders',
                  count: 0
                };
                results.order_items = {
                  status: 'skipped',
                  message: 'No products found for order items',
                  count: 0
                };
              } else {
                // Create 10 orders
                const createdOrders = [];
                for (let i = 0; i < 10; i++) {
                  const selectedUser = existingUsers[i % existingUsers.length];
                  const shippingAddress = existingAddresses[i % existingAddresses.length];
                  const billingAddress = existingAddresses[(i + 1) % existingAddresses.length];
                  
                  // Create order
                  const order = await db.insert(orders).values({
                    userId: selectedUser.id,
                    status: ['pending', 'processing', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
                    paymentStatus: ['pending', 'paid', 'failed'][Math.floor(Math.random() * 3)],
                    totalAmount: 0, // Will update after items
                    subtotal: 0, // Will update after items
                    tax: 0, // Will update after items
                    shippingFee: 10.00,
                    discount: 0,
                    paymentMethod: ['credit_card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
                    shippingAddressId: shippingAddress.id,
                    billingAddressId: billingAddress.id,
                    note: `Order #${i + 1}`
                  }).returning();

                  // Create 3-4 items per order
                  const numItems = Math.floor(Math.random() * 2) + 3; // 3 or 4 items
                  let orderSubtotal = 0;
                  
                  for (let j = 0; j < numItems; j++) {
                    const product = existingProducts[Math.floor(Math.random() * existingProducts.length)];
                    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
                    const unitPrice = Number(product.sellingPrice);
                    const totalPrice = unitPrice * quantity;
                    orderSubtotal += totalPrice;

                    await db.insert(orderItems).values({
                      orderId: order[0].id,
                      productId: product.id,
                      name: product.name,
                      sku: product.sku,
                      quantity: quantity,
                      unitPrice: unitPrice,
                      totalPrice: totalPrice
                    });
                  }

                  // Update order totals
                  const tax = orderSubtotal * 0.08; // 8% tax
                  const totalAmount = orderSubtotal + tax + 10.00; // subtotal + tax + shipping

                  await db.update(orders)
                    .set({
                      subtotal: orderSubtotal,
                      tax: tax,
                      totalAmount: totalAmount
                    })
                    .where(eq(orders.id, order[0].id));

                  createdOrders.push(order[0]);
                }

                results.orders = {
                  status: 'completed',
                  message: `Successfully created ${createdOrders.length} orders with items`,
                  count: createdOrders.length
                };
                results.order_items = {
                  status: 'completed',
                  message: `Successfully created ${createdOrders.length * 3} order item records`,
                  count: createdOrders.length * 3
                };
                console.log('Orders and order items creation completed successfully');
              }
            }
          }
        }
      } catch (error) {
        console.error('Orders and order items creation failed:', error);
        results.orders = {
          status: 'error',
          message: 'Failed to create orders and order items',
          count: 0
        };
        results.order_items = {
          status: 'error',
          message: 'Failed to create order items',
          count: 0
        };
      }

      console.log('All data insertion completed successfully.');
      return NextResponse.json({ 
        message: 'Seed data creation completed',
        results
      });
    } catch (error) {
      console.error('Error in seed data creation:', error);
      return NextResponse.json({ 
        message: 'Seed data creation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        results
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in seed data creation:', error);
    return NextResponse.json({ 
      message: 'Seed data creation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
}
