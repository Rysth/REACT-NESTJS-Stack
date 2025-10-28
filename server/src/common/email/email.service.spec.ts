import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "./email.service";

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should have sendVerificationEmail method", () => {
    expect(service.sendVerificationEmail).toBeDefined();
    expect(typeof service.sendVerificationEmail).toBe("function");
  });

  it("should have sendPasswordResetEmail method", () => {
    expect(service.sendPasswordResetEmail).toBeDefined();
    expect(typeof service.sendPasswordResetEmail).toBe("function");
  });

  it("should have sendEmail method", () => {
    expect(service.sendEmail).toBeDefined();
    expect(typeof service.sendEmail).toBe("function");
  });
});
