export type Address = {
  address_id: string;
  address_line1: string;
  address_line2: string;
  town: string;
  county: string;
  eirecode: string;
  updated_at: string;
  move_in_date?: string;
  move_out_date?: string;
  is_primary: boolean;
  ownership_status?: string;
};
