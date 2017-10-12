package main_test

import (
	"fmt"
	"net/url"
	"testing"
)


func TestRedisList(t *testing.T) {
	u, err := url.Parse("http://www.bing.com/search?q=dotnet")
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(u)
	fmt.Println(u.Scheme)
	fmt.Println(u.Opaque)
	fmt.Println(u.Host)
	fmt.Println(u.Path)
	fmt.Println(u.RawPath)
	fmt.Println(u.ForceQuery)
	fmt.Println(u.RawQuery)
	fmt.Println(u.Fragment)
}
