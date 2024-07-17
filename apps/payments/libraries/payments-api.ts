// import { Payments } from "building-blocks-sdk";
// import { getAuthenticationContext } from "./auth";
// import { notFound } from "next/navigation";

// export class PaymentsApiFactory {
//   static async getInstance() {
//     const { accessToken } = await getAuthenticationContext();

//     if (!accessToken) {
//       return notFound();
//     }

//     return new Payments(accessToken as string);
//   }
// }
