import { extendEnvironment } from "hardhat/config";
import { loadFixture, ethers, expect } from "./setup";

describe("Base", function() {
    async function deploy(_decimals1: number, _decimals2: number, _rate2to1: number){
        const [user1, user2] = await ethers.getSigners();

        // Deploy First contract with constructor arguments
        const FirstFactory = await ethers.getContractFactory("First");
        const name1 = "FirstToken";
        const symbol1 = "FTK";
        const initialSupply1 = 100000
        const first = await FirstFactory.deploy(name1, symbol1, _decimals1, initialSupply1);
        await first.waitForDeployment();

        // Deploy Second contract with constructor arguments
        const SecondFactory = await ethers.getContractFactory("Second");
        const name2 = "SecondToken";
        const symbol2 = "STK";
        const initialSupply2 = 100000
        const second = await SecondFactory.deploy(name2, symbol2, _decimals2, initialSupply2);
        await second.waitForDeployment();

        const SwapFactory = await ethers.getContractFactory("Swap");
        const swap = await SwapFactory.deploy(first.getAddress(), second.getAddress(), _rate2to1);
        await second.waitForDeployment();


        return{first, second, swap, user1, user2}
    }

    it("should be deployed", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 18, 18, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await second.getAddress();
        console.log("First contract address:", firstAddress);
        console.log("Second contract address:", secondAddress);
        console.log("Swap contract address:", swapAddress);
    
        expect(first.target).to.be.properAddress;
        expect(second.target).to.be.properAddress;
    });

    it("Money could be sent to Swap contract", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 18, 18, 1));
        await first.transfer(swap.getAddress(), 1 * 10 ** 5)

        expect(await first.balanceOf(swap.getAddress())).to.eq(1 * 10 ** 5);
    });

    it("Swap can get access to all User1's tokens", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 18, 18, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await second.getAddress();

        await first.connect(user1).approve(swapAddress, await first.totalSupply())

        const result = await first.allowance(user1.address, swapAddress);

        expect(result).to.eq(await first.totalSupply());
    });

    it("(1->2) Rate 1, 1 token with 3 decimals to 1 token with 5 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 3, 5, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, 1 * 10 ** 3);
        await second.transfer(swapAddress, 1 * 10 ** 5);

        // Меняем первый токен на второй
        await swap.connect(user1).swap(1, 1000);

        expect(await second.balanceOf(swapAddress)).eq(0);
    });

    it("(1->2) Rate 1, 1 token with 5 decimals to 1 token with 3 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 5, 3, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, 1 * 10 ** 5);
        await second.transfer(swapAddress, 1 * 10 ** 3);

        // Меняем первый токен на второй
        await swap.connect(user1).swap(1, 100000);

        expect(await second.balanceOf(swapAddress)).eq(0);
    });

    it("(1->2) Rate 1, 1 token with 1 decimals to 1 token with 1 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 1, 1, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, 1 * 10 ** 1);
        await second.transfer(swapAddress, 1 * 10 ** 1);

        // Меняем первый токен на второй
        await swap.connect(user1).swap(1, 10);

        expect(await second.balanceOf(swapAddress)).eq(0);
    });

    it("(2->1) Rate 1, 1 token with 3 decimals to 1 token with 0 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 0, 3, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, 1 * 10 ** 0);
        await second.transfer(swapAddress, 1 * 10 ** 3);

        // Меняем второй токен на первый
        await swap.connect(user1).swap(2, 1000);

        expect(await first.balanceOf(swapAddress)).eq(0);
    });

    it("(2->1) Rate 1, 1 token with 0 decimals to 1 token with 3 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 3, 0, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, 1 * 10 ** 3);
        await second.transfer(swapAddress, 1 * 10 ** 0);

        // Меняем второй токен на первый
        await swap.connect(user1).swap(2, 1);

        expect(await first.balanceOf(swapAddress)).eq(0);
    });

    it("(2->1) Rate 1, 3 token with 0 decimals to 3 token with 3 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 3, 0, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, 3 * 10 ** 3);
        await second.transfer(swapAddress, 3 * 10 ** 0);

        // Меняем второй токен на первый
        await swap.connect(user1).swap(2, 3);

        expect(await first.balanceOf(swapAddress)).eq(0);
    });

    it("(1->2) Rate 2, 2 token with 1 decimals to 1 token with 3 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 1, 3, 2));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await second.transfer(swapAddress, 1 * 10 ** 3);

        // Меняем первый токен на второй
        await swap.connect(user1).swap(1, 2 * 10 ** 1);

        expect(await second.balanceOf(swapAddress)).eq(0);
    });

    it("(1->2) Rate 2, 2 token with 3 decimals to 1 token with 1 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 3, 1, 2));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await second.transfer(swapAddress, 1 * 10 ** 1);

        // Меняем первый токен на второй
        await swap.connect(user1).swap(1, 2 * 10 ** 3);

        expect(await second.balanceOf(swapAddress)).eq(0);
    });

    it("(1->2) Rate 3, 3 token with 3 decimals to 1 token with 1 decimals", async function () {
        const { first, second, swap, user1 } = await loadFixture(deploy.bind(null, 3, 1, 3));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await second.transfer(swapAddress, 1 * 10 ** 1);

        // Меняем первый токен на второй
        await swap.connect(user1).swap(1, 3 * 10 ** 3);

        expect(await second.balanceOf(swapAddress)).eq(0);
    });

    it("Test Buy function: Token 1, Dec = 18, Rate = 1", async function () {
        const { first, second, swap, user1, user2 } = await loadFixture(deploy.bind(null, 18, 18, 1));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, await first.totalSupply());
        await second.transfer(swapAddress, await second.totalSupply());

        // Меняем первый токен на второй
        await swap.connect(user2).buyToken(1, {value: 1000});

        expect(await first.balanceOf(await user2.address)).eq(BigInt(1 * 10 ** 18));
    });

    it("Test Buy function: Token 2, Dec = 18, Rate = 2", async function () {
        const { first, second, swap, user1, user2 } = await loadFixture(deploy.bind(null, 18, 18, 2));

        const firstAddress = await first.getAddress();
        const secondAddress = await second.getAddress();
        const swapAddress = await swap.getAddress();

        // дали контракту полный апрув
        await first.connect(user1).approve(swapAddress, await first.totalSupply());
        await second.connect(user1).approve(swapAddress, await second.totalSupply());

        // дали ему ликву
        await first.transfer(swapAddress, await first.totalSupply());
        await second.transfer(swapAddress, await second.totalSupply());

        // Меняем первый токен на второй
        await swap.connect(user2).buyToken(2, {value: 2000});

        expect(await second.balanceOf(await user2.address)).eq(BigInt(1 * 10 ** 18));
    });
});