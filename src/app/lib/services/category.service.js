import { title } from "process";
import { prisma } from "../prisma.js";


function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, "") // remove all non-word chars
        .replace(/ +/g, "-"); // replace spaces with hyphens
}

const ensureuniqueSlug = async (model, slug, exculdeId = null) => {
    const exisiting  = await model.findUnique(
        {
            where: {
                slug
            }
        }
    )
    if (!exisiting) return slug

    if (exculdeId && exisiting.id === exculdeId) return slug;
    throw new Error(`Slug "${slug}" is already taken`);

}

// get categories
 export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { posts: true } },
        }
        
    });
 }

//  get category by id
 export async function getCategoryById(id) {
    return prisma.category.findUnique({
        where: { id },
        include: {
            posts: {
                select: {
                    id: true,
                    title: true,
                    slug: true
                }
            }
        }
    });
 }

 export async function createCategory(input) {
    const slug = input.slug?.trim()
        ? generateSlug(input.slug)
        : generateSlug(input.title);
    await ensureuniqueSlug(prisma.category, slug);
    
    return prisma.category.create({
        data: {
            name: input.name,
            slug,
            description: input.description ?? null

        }

    });
 }

 
export async function updateCategory(id, input) {
    const {id: _,  ...rest} = input;
    if (rest.name && !rest.slug) rest.slug = generateSlug(rest.name);
    if (rest.slug) {
        rest.slug = generateSlug(rest.slug);
        await ensureuniqueSlug(prisma.category, rest.slug, id);
    }
    return prisma.category.update({
        where: { id },
        data: rest,
    });
}
 export async function deleteCategory(id) {
    return prisma.category.delete({
        where: { id },
    });
 }