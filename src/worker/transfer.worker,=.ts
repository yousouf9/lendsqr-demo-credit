// import { Container } from "typedi";
// import { WalletService } from "../services/wallet.service";
// import { IdempotencyRepository } from "../repositories/idempotency.repository";
// import { redis } from "../config/database";
// import Queue from "bull";

// const transferQueue = new Queue("transfer-queue", { redis });

// transferQueue.process(async (job) => {
//   const walletService = Container.get(WalletService);
//   const idempotencyRepo = Container.get(IdempotencyRepository);
//   const { senderUserId, receiverAccountNo, amount, idempotencyKey } = job.data;

//   try {
//     const transaction = await walletService.processTransfer(
//       senderUserId,
//       receiverAccountNo,
//       amount,
//       idempotencyKey
//     );
//     await idempotencyRepo.saveResponse(idempotencyKey, transaction);
//     return transaction;
//   } catch (error) {
//     throw error;
//   }
// });

// console.log("Transfer worker started");
