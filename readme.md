Here are all API endpoints for both Pages and Menus:

---

### Pages

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/pages` | Get all pages |
| POST | `/api/pages` | Create new page |
| GET | `/api/pages/[id]` | Get single page by ID |
| PUT | `/api/pages/[id]` | Update page |
| PUT | `/api/pages/[id]` `{action:'publish'}` | Publish page |
| PUT | `/api/pages/[id]` `{action:'unpublish'}` | Unpublish page |
| DELETE | `/api/pages/[id]` | Delete page |
| GET | `/api/pages/slug/[slug]` | Get published page by slug |
| POST | `/api/pages/slug/[slug]/check` | Check slug availability |

---

### Menus

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/menus` | Get all menus with items |
| POST | `/api/menus` | Create new menu |
| GET | `/api/menus/[id]` | Get single menu by ID |
| PUT | `/api/menus/[id]` | Update menu name/location/items |
| DELETE | `/api/menus/[id]` | Delete menu + its items |
| GET | `/api/menus/location/[location]` | Get menu by header or footer |
| POST | `/api/menus/[id]/items` | Add item to menu |
| PUT | `/api/menus/[id]/items` | Reorder all items |
| PUT | `/api/menus/[id]/items/[itemId]` | Update single item |
| DELETE | `/api/menus/[id]/items/[itemId]` | Delete single item |

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