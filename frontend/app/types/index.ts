export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Role = 'BUYER' | 'SELLER';

export type User = {
  id: string;
  email: string;
  password: string;
  role: Role;
  rating?: number;
};

export type Bid = {
  id: string;
  sellerName: string;
  amount: number;
  durationDays: number;
  message: string;
  projectId: string;
  project: Project;
  sellerId: string;
  seller?: User;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string; // ISO string format
  status: ProjectStatus;
  buyerId: string;
  buyer?: User;
  bids: Bid[];
  selectedBidId?: string;
  selectedBid?: Bid;
  deliverable?: Deliverable;
};

export type Deliverable = {
  id: string;
  fileUrl: string;
  projectId: string;
};

export type Rating = {
  id: string;
  value: number;
  comment?: string;
  buyerId: string;
  sellerId: string;
};

export type NewProject = Omit<Project, 'id' | 'status' | 'bids' | 'selectedBidId' | 'selectedBid' | 'deliverable' | 'buyer'>;

export type NewBid = {
  sellerName: string;
  amount: number;
  durationDays: number;
  message: string;
  projectId: string;
  sellerId: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type SignupData = {
  email: string;
  password: string;
  role: Role;
};
