
from university import University
from department import Department

def main():
	lums = University("LUMS")
	
	eecs = Department(lums, "EECS");
	civil = Department(lums, "CIVIL");
	me = Department(lums, "MECHANICAL");

	lums.Print();


main()	