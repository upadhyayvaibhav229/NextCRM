Here are all API endpoints for both Pages and Menus:

---

## Editors Used

The NextCRM project uses the following editors for content creation:

- **Monaco Editor** (`@monaco-editor/react`): Used for writing and editing HTML and CSS code in pages and posts. Integrated into the content editors for both pages and posts, where you can switch to a "code" tab to edit raw HTML/CSS directly.
- **TipTap** (`@tiptap/react`): Used for visual editing (WYSIWYG) in pages and posts. Provides a rich text editor interface for content creation.

---

### Pages

### Pages

| Method | Endpoint                                 | What it does               |
| ------ | ---------------------------------------- | -------------------------- |
| GET    | `/api/pages`                             | Get all pages              |
| POST   | `/api/pages`                             | Create new page            |
| GET    | `/api/pages/[id]`                        | Get single page by ID      |
| PUT    | `/api/pages/[id]`                        | Update page                |
| PUT    | `/api/pages/[id]` `{action:'publish'}`   | Publish page               |
| PUT    | `/api/pages/[id]` `{action:'unpublish'}` | Unpublish page             |
| DELETE | `/api/pages/[id]`                        | Delete page                |
| GET    | `/api/pages/slug/[slug]`                 | Get published page by slug |
| POST   | `/api/pages/slug/[slug]/check`           | Check slug availability    |

---

### Menus

| Method | Endpoint                         | What it does                    |
| ------ | -------------------------------- | ------------------------------- |
| GET    | `/api/menus`                     | Get all menus with items        |
| POST   | `/api/menus`                     | Create new menu                 |
| GET    | `/api/menus/[id]`                | Get single menu by ID           |
| PUT    | `/api/menus/[id]`                | Update menu name/location/items |
| DELETE | `/api/menus/[id]`                | Delete menu + its items         |
| GET    | `/api/menus/location/[location]` | Get menu by header or footer    |
| POST   | `/api/menus/[id]/items`          | Add item to menu                |
| PUT    | `/api/menus/[id]/items`          | Reorder all items               |
| PUT    | `/api/menus/[id]/items/[itemId]` | Update single item              |
| DELETE | `/api/menus/[id]/items/[itemId]` | Delete single item              |

---

### Folder Structure

```
app/api/
├── pages/
│   ├── route.js                        GET, POST
│   ├── [id]/
│   │   └── route.js                    GET, PUT, DELETE
│   └── slug/
│       └── [slug]/
│           ├── route.js                GET
│           └── check/
│               └── route.js            POST
└── menus/
    ├── route.js                        GET, POST
    ├── [id]/
    │   ├── route.js                    GET, PUT, DELETE
    │   └── items/
    │       ├── route.js                POST, PUT
    │       └── [itemId]/
    │           └── route.js            PUT, DELETE
    └── location/
        └── [location]/
            └── route.js               GET
```

Here's every API endpoint:

**Posts**

```
GET     /api/posts
POST    /api/posts
GET     /api/posts/[id]
PUT     /api/posts/[id]
DELETE  /api/posts/[id]
POST    /api/posts/[id]/publish
POST    /api/posts/[id]/unpublish
POST    /api/posts/slug/[slug]/check
```

**Categories**

```
GET     /api/categories
POST    /api/categories
GET     /api/categories/[id]
PUT     /api/categories/[id]
DELETE  /api/categories/[id]
```

**Tags**

```
GET     /api/tags
POST    /api/tags
GET     /api/tags/[id]
PUT     /api/tags/[id]
DELETE  /api/tags/[id]
```

app/api/
├── posts/
│ ├── route.js GET (all) POST (create)
│ ├── [id]/
│ │ ├── route.js GET PUT DELETE
│ │ ├── publish/route.js POST
│ │ └── unpublish/route.js POST
│ └── slug/[slug]/check/route.js POST (slug availability)
├── categories/
│ ├── route.js GET POST
│ └── [id]/route.js GET PUT DELETE
└── tags/
├── route.js GET POST
└── [id]/route.js GET PUT DELETE
