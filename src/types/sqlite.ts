export interface DatedTextItem {
  BeginParagraphOrdinal: number;
  Caption: string;
  CaptionRich: string;
  DocumentId: number;
  EndParagraphOrdinal: number | null;
  FirstBibleCitationId: number | null;
  FirstDateOffset: number;
  FirstFootnoteId: number | null;
  LastBibleCitationId: number | null;
  LastDateOffset: number;
  LastFootnoteId: number | null;
  Link: string;
}

export interface DocumentItem {
  DocumentId: number;
}

export interface MultimediaItemsFetcher {
  db: string;
  docId?: number;
  mepsId?: number;
  lang?: string;
  BeginParagraphOrdinal?: number;
  EndParagraphOrdinal?: number;
}

export interface JwPlaylistItem {
  PlaylistItemId: number;
  Label: string;
  StartTrimOffsetTicks: number;
  EndTrimOffsetTicks: number;
  Accuracy: number;
  EndAction: number;
  ThumbnailFilePath: string;
  DurationTicks: number;
  OriginalFilename: string;
  IndependentMediaFilePath: string;
  MimeType: string;
  Hash: string;
  LocationId: number;
  BookNumber: number;
  ChapterNumber: number;
  DocumentId: number;
  Track: number;
  IssueTagNumber: number;
  KeySymbol: string;
  MepsLanguage: number;
  Type: number;
  Title: string;
}

export interface MultimediaItem {
  AlternativeLanguage?: string;
  BeginParagraphOrdinal: number;
  Caption: string;
  CaptionContent?: string | null;
  CaptionRich?: string | null;
  CategoryType: number;
  CreditLine?: string;
  CreditLineContent?: string | null;
  CreditLineRich?: string | null;
  DataType?: number;
  DocumentId: number;
  DocumentMultimediaId?: number;
  EndParagraphOrdinal?: number;
  FileName?: string;
  FilePath: string;
  Height?: number | null;
  IssueTagNumber?: number;
  KeySymbol?: string | null;
  Label: string;
  LabelRich?: string | null;
  Link?: string | null;
  LocalPath?: string;
  LinkMultimediaId?: number | null;
  MajorType: number;
  MepsDocumentId?: number | null;
  MepsLanguageIndex?: number;
  MimeType: string;
  MinorType?: number;
  Multimeps?: number | null;
  MultimediaId: number;
  NextParagraphOrdinal?: number;
  SizeConstraint?: number | null;
  SuppressZoom?: number;
  tableQuestionIsUsed?: boolean;
  TargetParagraphNumberLabel: number;
  Track?: number | null;
  Width?: number | null;
  ThumbnailFilePath?: string;
  VideoMarkers?: VideoMarker[];
}

export interface VideoMarker {
  VideoMarkerId: number;
  MultimediaId: number;
  Label: string;
  LabelRich: string;
  Caption: string;
  CaptionRich: string;
  Style: string;
  SegmentFormat: number;
  StartTimeTicks: number;
  DurationTicks: number;
  StartFrame: number;
  FrameCount: number;
  BeginTransitionDurationTicks: number;
  EndTransitionDurationTicks: number;
  BeginTransitionFrameCount: number;
  EndTransitionFrameCount: number;
}

export interface MultimediaExtractItem {
  BeginParagraphOrdinal: number;
  DocumentId: number;
  EndParagraphOrdinal: number;
  FilePath?: string;
  IssueTagNumber: string;
  Lang: string;
  Link: string;
  RefBeginParagraphOrdinal: number | null;
  RefEndParagraphOrdinal: number | null;
  RefMepsDocumentId: number;
  RefPublicationId: number;
  UniqueEnglishSymbol: string;
}

export interface DocumentItem {
  Title: string;
  FeatureTitle: string;
}

export interface PublicationItem {
  UniqueEnglishSymbol: string;
  IssueTagNumber: number;
  UndatedSymbol: string;
  MepsLanguageIndex: number;
}

export interface PublicationIssuePropertyItem {
  Title: string;
}

export interface MultimediaExtractRefItem {
  BeginParagraphOrdinal: number;
  DocumentId: number;
  SourceDocumentId: number;
}

export interface TableItem {
  name: string;
}

export interface PlaylistTagItem {
  Name: string;
}

export type QueryResponseItem =
  | DatedTextItem
  | DocumentItem
  | MultimediaExtractRefItem
  | MultimediaExtractItem
  | MultimediaItem
  | PublicationItem
  | TableItem
  | JwPlaylistItem
  | PlaylistTagItem
  | VideoMarker;
