export type ArticleType = {
  ID: string;
  SiteID: string | null;
  Language: string | null;
  ParentID: string | null;
  Title: string | null;
  DisplayTitle: string | null;
  Abstract: string | null;
  Article: string | null;
  CustomField1_Title: string | null;
  CustomField1: string | null;
  Banner: string | null;
  Keywords: string | null;
  SortOrder: number | null;
  PublishStartDate: Date | null;
  PublishEndDate: Date | null;
  Status: string | null;
  Navigation: string | null;
  ShowInNav: string | null;
  System: string | null;
  EditorCreated: string | null;
  DateCreated: Date | null;
  EditorModified: string | null;
  DateModified: Date | null;
  ModuleID: string;
}

export const articlesSelect = {
  ID: true,
  SiteID: true,
  Language: true,
  ParentID: true,
  Title: true,
  DisplayTitle: true,
  Abstract: true,
  Article: true,
  CustomField1_Title: true,
  CustomField1: true,
  Banner: true,
  Keywords: true,
  SortOrder: true,
  PublishStartDate: true,
  PublishEndDate: true,
  Status: true,
  Navigation: true,
  ShowInNav: true,
  System: true,
  EditorCreated: true,
  DateCreated: true,
  EditorModified: true,
  DateModified: true,
  ModuleID: true
}

