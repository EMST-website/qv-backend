import { AdminRolesEnum } from "@/modules/admins/schema/admins.schema";


export interface AdminPayload {
   id: string;
   first_name: string;
   last_name: string;
   role: AdminRolesEnum
   iat: number;
   exp: number;
};
