# Demo video script (~90–120 seconds)

Record terminal + browser. Speak in Chinese or English.

1. **(10s) Hook**  
   “Agents usually stop at reasoning. This one lands a real transfer through KeeperHub.”

2. **(20s) Show code path**  
   Open `src/agent.ts` briefly — highlight simulate → execute → poll.  
   Say: “Execution is KeeperHub Direct Execution API, not a local ethers send.”

3. **(40s) Live run**  
   ```bash
   npm run demo
   ```  
   Show `whoami` org wallet, then the transfer completing.  
   Copy `transactionLink`.

4. **(20s) Proof**  
   Open the explorer link in a browser. Point at success / hash.  
   If sponsored, note gas may be paid by relayer — hash from KeeperHub status is authoritative.

5. **(10s) Close**  
   “Repo + tx link submitted on DoraHacks. Thanks KeeperHub.”

## Tips

- Use Base Sepolia, `amount 0` self-transfer — fastest reliable proof.
- Zoom terminal font; hide `.env` / API keys.
- Upload to YouTube (unlisted) or Loom before the deadline.
