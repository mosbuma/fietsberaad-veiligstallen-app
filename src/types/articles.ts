export type VSArticle = {
  ID: string,
  SiteID: string,
  Title: string,
  DisplayTitle: string,
  DateCreated: Date,
  DateModified: Date,
  Abstract: string,
  Article: string,
  CustomField1_Title: string,
  CustomField1: string,
  SortOrder: number,
  ShowInNav: string,
  ModuleID: string,
  Navigation: string
}

export const articlesSelect = {
  ID: true,
  SiteID: true,
  Title: true,
  DisplayTitle: true,
  DateCreated: true,
  DateModified: true,
  Abstract: true,
  Article: true,
  CustomField1_Title: true,
  CustomField1: true,
  SortOrder: true,
  ShowInNav: true,
  ModuleID: true,
  Navigation: true
}

