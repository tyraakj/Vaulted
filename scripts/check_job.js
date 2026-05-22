import { ethers } from 'ethers';

const RPC = 'https://sepolia.base.org';
const CONTRACT = process.env.VITE_CONTRACT_ADDRESS || '0x213c203d44Ca3Cf4a74ee8B2C2BA75f60A80B911';

const ABI = [
  'function jobCount() view returns (uint256)',
  'function jobs(uint256) view returns (uint256 id,string title,string description,address client,address freelancer,uint256 amount,uint8 status,uint256 createdAt,uint256 autoReleaseAt)'
];

async function main(){
  const provider = new ethers.JsonRpcProvider(RPC);
  const contract = new ethers.Contract(CONTRACT, ABI, provider);

  const count = await contract.jobCount();
  console.log('jobCount:', count.toString());
  if (Number(count) === 0){
    console.log('No jobs recorded on-chain yet.');
    return;
  }

  const job = await contract.jobs(count);
  console.log('Latest job:', {
    id: job.id.toString(),
    title: job.title,
    description: job.description,
    client: job.client,
    freelancer: job.freelancer,
    amount: ethers.formatUnits(job.amount, 6),
    status: job.status,
    createdAt: new Date(Number(job.createdAt) * 1000).toISOString(),
    autoReleaseAt: new Date(Number(job.autoReleaseAt) * 1000).toISOString(),
  });

  // Find the corresponding JobCreated event and print its tx hash
  const topic = ethers.id('JobCreated(uint256,address,uint256)');
  const logs = await provider.getLogs({ address: CONTRACT, topics: [topic] });
  if (logs && logs.length > 0) {
    const last = logs[logs.length - 1];
    console.log('JobCreated txHash:', last.transactionHash);
  } else {
    console.log('No JobCreated logs found for contract');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
