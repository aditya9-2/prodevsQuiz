# Clone the repo 
```
git clone https://github.com/aditya9-2/prodevsQuiz.git
```
## Go to directory
```
cd prodevsQuiz 
```

## install dependencies with pnpm

```
pnpm install
```
## add .env file and inside .env -
```
DATABASE_URL="get a DB URL from neonDB"
JWT_SECRET_KEY="your_secret_key"
```

## migrate prisma 

```
pnpm prisma mimgrate dev
```
## to run the project - 
```
pnpm run dev
```

