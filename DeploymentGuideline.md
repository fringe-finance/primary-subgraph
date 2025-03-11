# SubGraph Deployment Guideline

## Description
Deploy the subgraph with Subgraph Studio

## Quick start

**Step 1:** Access the **Dashboard** page: [Hosted Service](https://thegraph.com/hosted-service/dashboard) and sign in with Github account:



<p align="center">
  <img alt="Subgraph Sign In" src="./img/sub-sign-in.png">
</p>


---

**Step 2:** Store the `ACCESS_TOKEN`.  
After signing in with Github account, copy and store the access token displayed on the dashboard:

<p align="center">
  <img alt="Subgraph Access Token" src="./img/sub-access-token.png">
</p>


---

**Step 3:** Pull code from **develop** branch. Connect your Github account.

---

**Step 4:** Install dependencies package:  
```
yarn
```
or 
```
npm install
```

---

**Step 5:** Create subgraph on **The Graph Explorer:**  

Back to **dashboard** page, click on the **Add Subgraph** button and fill in the information below as appropriate:

* **Subgraph Name** - Together with the account name that the subgraph is created under, this will also define the account-name/subgraph-name-style name used for deployments and GraphQL endpoints. This field cannot be changed later.

* **Account** - The account that the subgraph is created under. This can be the account of an individual or organization. Subgraphs cannot be moved between accounts later.

* **Subtitle** - Text that will appear in subgraph cards.

* **Hide** - Switching this on hides the subgraph in the Graph Explorer.

*(These are the four mandatory parameters we have to pay attention to)*

**Example:**

* **Subgraph Name:** PLP-Mainnet

* **Account:** Fringe

* **Subtitle:** PLP Mainnet

* **Hide:** true

From the above information, we will get **name_used_for_deployments** is **fringe/plp-mainnet**

After saving the new subgraph, you are shown a screen with help on how to install the Graph CLI, how to generate the scaffolding for a new subgraph, and how to deploy your subgraph.

---

**Step 6:** Setup **ACCESS_TOKEN**:

Back to **local project** and run this command with **ACCESS_TOKEN** taken above:
```
graph auth --product hosted-service <ACCESS_TOKEN>
```
This will store the access token on your computer. You only need to do this once.

---

**Step 7:** Setup file config with the network you want to deploy:

At the folder **config**, create file **config.json **according to the following name rule:

File name = `<network_name>.json`

The **network_name** takes the list below:

**Mainnet:**

* `mainnet` (Ethereum)

* `matic`

* `optimism`

* `arbitrum-one`

**Testnet:**

* `goerli`

* `mumbai`

* `optimism-goerli`

* `arbitrum-goerli`

Then, set the following in your config file:

```
{
    "network": "<network_name>",
    "address": "<pit_contract_address>",
    "startBlock": "<init_block_of_contract>"
}
```

**Example:** Create file config mainnet.json that includes content:

```
{
    "network": "mainnet",
    "address": "0x46558DA82Be1ae1955DE6d6146F8D2c1FE2f9C5E",
    "startBlock": "14847363"
}
```

---

**Step 8:** Apply file config by running command:
```
mustache config/<network_name>.json subgraph.template.yaml > subgraph.yaml
```

---

**Step 9:** Build Subgraph:
```
graph build
```

---

**Step 10:** Deploy Subgraph:
```
graph deploy --product hosted-service <name_used_for_deployments>
```

**name_used_for_deployments** taken from step 2

*****Note:** Re-deploy new Subgraph with another network you want to deploy by looping steps 5 to step 10