// ==========================
// Enums / Literal Types
// ==========================

/** Possible statuses for a project */
export type ProjectStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED';

/** User roles in the system */
export type Role = 'BUYER' | 'SELLER';

export type Currency =
  | "USD"
  | "EUR"
  | "INR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY";
// ==========================
// Core Entity Types
// ==========================

/**
 * Represents a user in the system.
 * - Sellers can receive ratings and place bids.
 * - Buyers can create projects and give ratings.
 */
export type User = {
  id: string;
  name?: string;
  description?: string; 
  profileImage?: string;
  email: string;
  password?: string;
  role: Role;
  rating?: number; // Average rating received by the seller
  bids?: Bid[]; // Bids placed by the seller
  projects?: Project[]; // Projects created by the buyer
  ratings?: Rating[]; // Ratings given by the buyer
  receivedRatings?: Rating[]; // Ratings received by the seller
  sentMessages?: Message[]; // Messages sent by the user
  sentConversations?: Conversation[]; // Conversations where user is sender
  receivedConversations?: Conversation[]; // Conversations where user is receiver
};

/**
 * Represents a bid placed by a seller on a project.
 */
export type Bid = {
  id: string;
  sellerName: string;
  amount: number; // Proposed cost
  durationDays: number; // Estimated delivery time
  message: string; // Optional message to buyer
  projectId: string;
  project?: Project; // Associated project
  sellerId: string;
  seller?: User; // Seller info
  selectedFor?: Project; // If selected, the project this bid is assigned to
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Represents a project created by a buyer.
 */
export type Project = {
  id: string;
  title: string;
  description: string;
  budget: string;
  budgetCurrency: Currency; 
  deadline: string; // ISO format
  status: ProjectStatus;
  progress?: number; // 0 to 100
  buyerId: string;
  buyer?: User;
  bids: Bid[];
  selectedBidId?: string;
  selectedBid?: Bid;
  deliverable?: Deliverable;
  rating?: Rating; // Rating given to the seller after completion
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Represents a file submitted by the seller as project output.
 */
export type Deliverable = {
  id: string;
  fileUrl: string; // URL to download the file
  projectId: string;
  project?: Project;
};

/**
 * Represents a rating given by a buyer to a seller for a completed project.
 */
export type Rating = {
  id: string;
  value: number; // Rating value (e.g., 1–5)
  comment?: string; // Optional feedback
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  projectId: string;
  project?: Project;
};

// ==========================
// Input Types (for API payloads)
// ==========================

/**
 * Payload for creating a new project.
 * Excludes auto-generated and system-managed fields.
 */
export type NewProject = Omit<
  Project,
  'id' | 'status' | 'bids' | 'selectedBidId' | 'selectedBid' | 'deliverable' | 'buyer' | 'rating'
>;

/**
 * Payload for creating a new bid.
 */
export type NewBid = {
  sellerName: string;
  amount: number;
  durationDays: number;
  message: string;
  projectId: string;
  sellerId: string;
};

/**
 * Login request payload.
 */
export type LoginData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

/**
 * Signup request payload.
 */
export type SignupData = {
  email: string;
  password: string;
  role: Role;
  rememberMe?: boolean;
};

// ==========================
// Chat Entity Types
// ==========================

/**
 * Represents a conversation between two users.
 * Assumes a one-to-one chat between sender and receiver.
 */
export type Conversation = {
  id: string;
  participants: [string, string]; // user IDs of both participants
  users?: User[];
  createdAt?: string;
  updatedAt?: string;
  otherUser?:{
    email: string;
  }
};

/**
 * Represents a message sent within a conversation.
 */
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
};

