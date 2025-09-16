# Airtable Schema for CoactionConnect2

## 📊 Table Relationships

```
Projects (Master Table)
├── Project ID: "coaction", "zrmc", "tgmc"
├── Name: "Coaction", "Zion Regional Medical Center", "Texas General Medical Center"
└── Status: "Active", "Inactive"

Logos Table
├── Name, Type, Format, Size, File
├── Project → Links to Projects table
└── Uploaded By, Upload Date

Colors Table  
├── Name, Hex Code, Usage, Pantone
├── Project → Links to Projects table
└── Created Date

Fonts Table
├── Name, Weight, Usage, Family, File
├── Project → Links to Projects table
└── Uploaded By

Knowledge Files Table
├── File Name, Category, Tags, File Type, File Size, File
├── Project → Links to Projects table
└── Uploaded By, Upload Date

Social Posts Table
├── Content, Platforms, Status, Scheduled Date, Publish Date
├── Project → Links to Projects table
└── Created By, Approved By, Created Date
```

## 🔗 Key Relationships

- **Projects** is the master table that all other tables link to
- Each asset/record is linked to exactly one project
- This ensures data isolation between projects
- Easy to see all assets for a specific project
- Simple to add new projects in the future

## 📋 Setup Checklist

- [ ] Create Projects table with 3 records
- [ ] Create 5 asset tables (Logos, Colors, Fonts, Knowledge Files, Social Posts)
- [ ] Set up Project links in each table
- [ ] Get API key from Airtable account
- [ ] Get Base ID from your base
- [ ] Update config.ts with credentials
- [ ] Test upload in app
- [ ] Verify data appears in Airtable with correct project links
