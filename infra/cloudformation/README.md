# CloudFormation Stacks

This folder contains modular CloudFormation templates to deploy:
- VPC with public/private subnets and NAT
- RDS PostgreSQL
- ALB (frontend and backend) with HTTPS listeners
- Auto Scaling Groups (frontend and backend) with Launch Templates

## Order of deployment
1. `vpc.yml`
2. `rds.yml`
3. `alb.yml`
4. `frontend-asg.yml`
5. `backend-asg.yml`

Use stack outputs to wire parameters into subsequent stacks.

## Parameters overview
- VPC stack exports: `VpcId`, `PublicSubnets`, `PrivateSubnets`
- RDS stack outputs: `DBEndpoint`, `DBSecGroup`
- ALB stack outputs: `FrontendALBDNS`, `BackendALBDNS`, target group ARNs
- ASG stacks require: Subnets, SecurityGroups, TargetGroupARNs, AMI, KeyName, and UserData vars

Deploy example:
```
aws cloudformation deploy \
  --stack-name ims-vpc \
  --template-file vpc.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Env=prodVpc CidrBlock=10.0.0.0/16
```
