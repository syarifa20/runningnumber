import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

interface Ability {
  action: string;
  subject: string;
}

interface UserPayload {
  username: string;
  abilities: Ability[];
}

export function authorize(actions: string[], subject: string) {
  return (handler: Function) => {
    return async (req: NextRequest, res: NextResponse) => {
      const token = req.headers.get("authorization")?.split(" ")[1];

      if (!token) {
        return NextResponse.json(
          { message: "Unauthorized: Token is missing" },
          { status: 401 }
        );
      }

      try {
        const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "123456");
        const { payload } = await jwtVerify(token, secretKey);
        const userPayload = payload as unknown as UserPayload;

        if (!userPayload.abilities || userPayload.abilities.length === 0) {
          return NextResponse.json(
            { message: "Unauthorized: User abilities not found in token" },
            { status: 401 }
          );
        }

        const hasAbility = userPayload.abilities.some((ability) =>
          actions.includes(ability.action) && 
          ability.subject.toLowerCase() === subject.toLowerCase()
        );

        if (!hasAbility) {
          return NextResponse.json(
            { message: "Forbidden: You don't have the required permissions" },
            { status: 403 }
          );
        }

        return handler(req, res);
      } catch (error) {
        console.error("Token verification failed:", error);
        return NextResponse.json(
          { message: "Invalid or expired token" },
          { status: 401 }
        );
      }
    };
  };
}
