export type VSArticle = {
  ID: string,
  SiteID: string,
  Title: string,
  DisplayTitle: string,
  DateCreated: Date,
  DateModified: Date,
  EditorCreated: Date,
  EditorModified: Date,
  Abstract: string,
  Article: string,
  SortOrder: number,
  ShowInNav: string,
  ModuleID: string,
  Navigation: string,
  Status: string
}

export const articlesSelect = {
  ID: true,
  SiteID: true,
  Title: true,
  DisplayTitle: true,
  DateCreated: true,
  DateModified: true,
  EditorCreated: true,
  EditorModified: true,
  Abstract: true,
  Article: true,
  SortOrder: true,
  ShowInNav: true,
  ModuleID: true,
  Navigation: true,
  Status: true
}

